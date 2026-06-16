function expandNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName("Data");
  const idMapSheet = ss.getSheetByName("ID_Map");

  const masterDivisi = {
    "Widian": "AI & Data", "Artur": "Prodev", "Monika": "Admin", 
    "Arul": "Prodev", "Rizki": "Prodev", "Salman": "Creative", 
    "Calista": "Creative", "Fadil": "Prodev", "Bhagas": "Prodev", 
    "Wulan": "Project Manager", "Aslam": "AI & Data", "Prima": "Project Manager", 
    "Vina": "Prodev", "Valdi": "Prodev", "Dea": "Project Manager", 
    "Afif": "AI & Data", "Riri": "Prodev", "Rafly": "Prodev", 
    "Firgie": "Creative", "Hasti": "AI & Data", "Mutia": "Prodev", 
    "Nabila": "Prodev", "Asa": "Prodev", "Falah": "Creative", 
    "Nana": "Prodev", "Januar Dwigo": "IoT", "Fadli": "IoT", 
    "Tezar": "IoT", "Rafid": "Bisdev", "Haqi": "Bisdev", "Helmy": "Bisdev"
  };

  const sources = [
    { sheet: "IoT",             bulan: 0, minggu: 1, nama: 2, tugas: 3, detail: 4, jenis: 5, instansi: 6, status: 8, deadline: 7, output: -1, divisi: "IoT" },
    { sheet: "Project_Manager", bulan: 0, minggu: 1, nama: 8, tugas: 2, detail: 3, jenis: 4, instansi: 5, status: 6, deadline: 7, output: -1, divisi: "Project Manager" },
    { sheet: "AI_Data",         bulan: 0, minggu: 1, nama: 2, tugas: 3, detail: 4, jenis: 5, instansi: 6, status: 8, deadline: 7, output: -1, divisi: "AI & Data" },
    { sheet: "Prodev",          bulan: 0, minggu: 1, nama: 2, tugas: 5, detail: 6, jenis: 7, instansi: 8, status: 10, deadline: 9, output: -1, divisi: "Prodev" },
    { sheet: "Creative",        bulan: 0, minggu: 1, nama: 2, tugas: 3, detail: 4, jenis: 5, instansi: 6, status: 8, deadline: 7, output: -1, divisi: "Creative" },
    { sheet: "Bisdev",          bulan: 0, minggu: 1, nama: 9, tugas: 3, detail: 10, jenis: 5, instansi: 6, status: 8, deadline: 7, output: 4,  divisi: "Bisdev" },
    { sheet: "Admin",           bulan: 0, minggu: 1, nama: 9, tugas: 2, detail: 3, jenis: 4, instansi: 5, status: 6, deadline: 7, output: -1, divisi: "Admin" },
  ];

  const idMap = {};
  const idMapData = idMapSheet.getDataRange().getValues();
  
  let maxTaskId = 0;
  let maxUserId = 0;

  idMapData.forEach(row => {
    if (row[0] && row[1]) {
      idMap[row[0]] = row[1];
      
      const matchT = row[1].toString().match(/T(\d+)/);
      if (matchT) {
        const numT = parseInt(matchT[1]);
        if (numT > maxTaskId) maxTaskId = numT;
      }

      const matchU = row[1].toString().match(/U(\d+)/);
      if (matchU) {
        const numU = parseInt(matchU[1]);
        if (numU > maxUserId) maxUserId = numU;
      }
    }
  });
  
  let taskIdCounter = maxTaskId + 1;
  let userIdCounter = maxUserId + 1;

  const header = ["User ID", "Task ID", "Bulan", "Minggu", "Nama", "Divisi", "Tugas", "Detail", "Jenis", "Nama Instansi", "Status", "Deadline", "Output"];
  const newIdMapObj = {}; 
  
  // Pakai object untuk menyimpan status terakhir berdasarkan orang dan tugasnya
  const latestAssignments = {}; 

  sources.forEach(src => {
    const sheet = ss.getSheetByName(src.sheet);
    if (!sheet) return;

    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1);

    // Logika ini otomatis mengisi sel yang kosong akibat Merge Cells (Bulan, Minggu, Nama)
    let lastVals = new Array(data[0].length).fill("");
    const filledRows = rows.map(row => {
      return row.map((cell, i) => {
        if (i === src.output) return cell;
        if (cell !== "") {
          lastVals[i] = cell;
          return cell;
        }
        return lastVals[i];
      });
    });

    filledRows.forEach(row => {
      const bulan    = src.bulan >= 0 ? row[src.bulan] : "";
      const minggu   = src.minggu >= 0 ? row[src.minggu] : "";
      const namaRaw  = row[src.nama];
      const tugas    = src.tugas >= 0 ? row[src.tugas] : "";
      const detail   = src.detail >= 0 ? row[src.detail] : ""; 
      const jenis    = src.jenis >= 0 ? row[src.jenis] : "";
      const instansi = src.instansi >= 0 ? row[src.instansi] : "";
      const status   = normalizeStatus(src.status >= 0 ? row[src.status] : "");
      const output   = src.output >= 0 ? row[src.output] : "";

      // Logika Deadline agar murni text (menghindari error jika dicampur text & tanggal)
      let rawDeadline = src.deadline >= 0 ? row[src.deadline] : "";
      let deadlineText = "";
      if (rawDeadline instanceof Date) {
        deadlineText = Utilities.formatDate(rawDeadline, Session.getScriptTimeZone(), "dd/MM/yyyy");
      } else if (rawDeadline !== "") {
        deadlineText = rawDeadline.toString().trim();
      }

      if (!namaRaw || namaRaw.toString().trim() === "") return;

      const taskKey = `TASK|${src.divisi}|${tugas}|${detail}|${namaRaw}`;
      let taskId = idMap[taskKey];
      if (!taskId) { 
        taskId = "T" + String(taskIdCounter).padStart(3, "0");
        taskIdCounter++;
        idMap[taskKey] = taskId;
      }
      newIdMapObj[taskKey] = taskId;

      // Logika nama via split, cukup untuk dropdown/nama yang disatukan dgn koma
      let names = namaRaw.toString()
        .split(/[&,]/)
        .map(n => n.trim())
        .filter(n => n !== "");

      names.forEach(name => {
        const userKey = `USER|${name}`;
        let userId = idMap[userKey];
        if (!userId) {
          userId = "U" + String(userIdCounter).padStart(3, "0");
          userIdCounter++;
          idMap[userKey] = userId; 
        }
        newIdMapObj[userKey] = userId; 

        // Cek apakah 'name' ada di dalam masterDivisi.
        const divisiAsli = masterDivisi[name] ? masterDivisi[name] : src.divisi;

        // Menyimpan Status Terakhir
        const assignmentKey = `${userId}_${taskId}`;
        
        latestAssignments[assignmentKey] = [
          userId, taskId, bulan, minggu, name, divisiAsli, 
          tugas, detail, jenis, instansi, status, deadlineText, output
        ];
      });
    });
  });

  // Update ID_Map
  idMapSheet.clearContents();
  const newIdMapArray = Object.entries(newIdMapObj);
  if (newIdMapArray.length > 0) {
    idMapSheet.getRange(1, 1, newIdMapArray.length, 2).setValues(newIdMapArray);
  }

  const newRows = Object.values(latestAssignments);

  // Full sync sheet Data
  dataSheet.clearContents();
  dataSheet.appendRow(header);
  
  if (newRows.length > 0) {
    // Set format kolom Deadline (Kolom 12 / L) jadi format Plain Text terlebih dahulu
    dataSheet.getRange(2, 12, newRows.length, 1).setNumberFormat("@");
    
    // Tulis semua data
    dataSheet.getRange(2, 1, newRows.length, header.length).setValues(newRows);
  }
  
  console.log("Sync selesai! " + newRows.length + " baris tanpa duplikat status.");
}

function normalizeStatus(status) {
  if (!status) return "";
  const s = status.toString().trim().toLowerCase();
  if (s === "done") return "Done";
  if (s === "on progress") return "On Progress";
  if (s === "to do") return "To Do";
  if (s === "on hold" || s === "hold") return "On Hold";
  if (s === "not started") return "To Do";
  if (s === "no progress") return "On Progress";
  if (s === "revision") return "On Progress"; 
  if (s === "pending") return "On Hold";
  if (s === "stop") return "Stop"
  return status.toString().trim();
}