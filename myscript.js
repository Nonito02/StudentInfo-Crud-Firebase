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
      complete: async function (results) {
        const students = results.data;
        console.log("Parsed students:", students);

        let importedCount = 0;
        let skippedCount = 0;

        tableBody.innerHTML = "";

        for (const student of students) {
          const name = student.name?.toString().trim();
          const course = student.course?.toString().trim();
          const status = student.status?.toString().trim();

          if (name && course && status) {
            const newStudent = { name, course, status };

            try {
              await studentRef.push(newStudent); // Store in Firebase
              addStudentRow(newStudent);         // Show in table
              importedCount++;
            } catch (error) {
              console.error("Error saving to Firebase:", error);
              skippedCount++;
            }
          } else {
            console.warn("Skipped invalid row:", student);
            skippedCount++;
          }
        }

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
