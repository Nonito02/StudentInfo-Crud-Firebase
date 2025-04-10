<script>
  const studentRef = firebase.database().ref("students");
  let importedStudents = []; // Holds previewed data

  function addStudentRow(student) {
    const tableBody = document.getElementById("studentTableBody");
    const row = tableBody.insertRow();
    row.insertCell(0).innerText = student.name || "";
    row.insertCell(1).innerText = student.course || "";
    row.insertCell(2).innerText = student.status || "";
  }

  // Preview data only (don't insert yet)
  document.getElementById("importData").addEventListener("click", () => {
    const fileInput = document.getElementById("excelFile");
    const tableBody = document.getElementById("studentTableBody");

    if (!fileInput.files.length) {
      return alert("Please select an Excel file.");
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const students = XLSX.utils.sheet_to_json(sheet);

      // Clear previous
      tableBody.innerHTML = "";
      importedStudents = [];

      students.forEach(student => {
        if (student.name && student.course && student.status) {
          importedStudents.push(student);
          addStudentRow(student);
        }
      });

      if (importedStudents.length > 0) {
        alert("Data previewed successfully! Click 'Insert All to Firebase' to upload.");
        document.getElementById("insertAll").style.display = "inline-block";
      } else {
        alert("No valid data found.");
      }
    };

    reader.onerror = function (error) {
      console.error("File Error:", error);
      alert("Error reading the Excel file.");
    };

    reader.readAsArrayBuffer(fileInput.files[0]);
  });

  // Insert to Firebase
  document.getElementById("insertAll").addEventListener("click", async () => {
    if (!importedStudents.length) {
      return alert("No data to insert.");
    }

    let success = 0;
    let failed = 0;

    for (const student of importedStudents) {
      try {
        await studentRef.push(student);
        success++;
      } catch (error) {
        console.error("Insert error:", error);
        failed++;
      }
    }

    alert(`Insert completed!\nSuccess: ${success}\nFailed: ${failed}`);
    document.getElementById("insertAll").style.display = "none";
    importedStudents = [];
  });
</script>
