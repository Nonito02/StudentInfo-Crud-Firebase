<script>
  // Initialize Firestore and Realtime Database
  const db = firebase.firestore();
  const studentRefFirestore = db.collection("student"); // Firestore reference
  const studentRefRealtime = firebase.database().ref("newStudentTable"); // Realtime Database reference (using a different path)

  let importedStudents = []; // Holds previewed data

  // Function to add a student row to the table for preview
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

      // Clear previous data in the table
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

  // Insert data into Firestore and Realtime Database when 'Insert All to Firebase' is clicked
  document.getElementById("insertAll").addEventListener("click", async () => {
    if (!importedStudents.length) {
      return alert("No data to insert.");
    }

    let successFirestore = 0;
    let successRealtime = 0;
    let failed = 0;

    for (const student of importedStudents) {
      try {
        // Insert each student into Firestore
        await studentRefFirestore.add(student);
        successFirestore++;

        // Insert each student into Firebase Realtime Database under a different table
        await studentRefRealtime.push(student);
        successRealtime++;

      } catch (error) {
        console.error("Insert error:", error);
        failed++;
      }
    }

    alert(`Insert completed!\nFirestore Success: ${successFirestore}\nRealtime Success: ${successRealtime}\nFailed: ${failed}`);
    document.getElementById("insertAll").style.display = "none";
    importedStudents = []; // Reset the imported data after insertion
    document.getElementById("studentTableBody").innerHTML = ""; // Clear preview table
  });
</script>
