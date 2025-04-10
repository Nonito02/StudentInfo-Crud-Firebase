// IMPORT FROM CSV
document.getElementById("importData").onclick = function () {
  const fileInput = document.getElementById("importFile");
  const tableBody = document.getElementById("studentTableBody");

  if (!fileInput.files.length) {
    return alert("Please select a file to import.");
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    Papa.parse(e.target.result, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        const students = results.data;
        console.log("Parsed students:", students); // 👈 Debug log

        let importedCount = 0;
        let skippedCount = 0;

        tableBody.innerHTML = "";

        students.forEach(student => {
          // Trim and validate
          const name = student.name?.toString().trim();
          const course = student.course?.toString().trim();
          const status = student.status?.toString().trim();

          if (name && course && status) {
            const newStudent = { name, course, status };
            studentRef.push(newStudent);
            addStudentRow(newStudent);
            importedCount++;
          } else {
            console.warn("Skipped invalid row:", student); // 👈 Warn on invalid row
            skippedCount++;
          }
        });

        alert(`CSV Import complete.\nImported: ${importedCount}\nSkipped: ${skippedCount}`);
      },
      error: function (error) {
        console.error("CSV Parse Error:", error);
        alert("Error processing the CSV file.");
      }
    });
  };

  reader.onerror = function (error) {
    console.error("File Read Error:", error);
    alert("Error reading the selected file.");
  };

  reader.readAsText(fileInput.files[0]);
};
