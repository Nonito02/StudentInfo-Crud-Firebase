// Global variable to store imported data
let importedStudents = [];

// IMPORT FROM CSV (PREVIEW ONLY)
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
        importedStudents = results.data.filter(student =>
          student.name && student.course && student.status
        );

        tableBody.innerHTML = "";
        importedStudents.forEach(addStudentRow);

        if (importedStudents.length > 0) {
          alert("Data previewed successfully! Click 'Insert All to Firebase' to upload.");
          document.getElementById("insertAll").style.display = "inline-block";
        } else {
          alert("No valid rows found in CSV.");
        }
      },
      error: function (error) {
        console.error("CSV Error:", error);
        alert("Error processing the CSV file.");
      }
    });
  };

  reader.onerror = function (error) {
    console.error("File Error:", error);
    alert("Error reading the selected file.");
  };

  reader.readAsText(fileInput.files[0]);
};

// INSERT ALL IMPORTED DATA TO FIREBASE
document.getElementById("insertAll").onclick = async function () {
  if (!importedStudents.length) {
    return alert("No imported data to insert.");
  }

  let successCount = 0;
  let failCount = 0;

  for (const student of importedStudents) {
    const newStudent = {
      name: student.name.toString().trim(),
      course: student.course.toString().trim(),
      status: student.status.toString().trim()
    };

    try {
      await studentRef.push(newStudent);
      successCount++;
    } catch (error) {
      console.error("Insert error:", error);
      failCount++;
    }
  }

  alert(`Insert Complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
  importedStudents = [];
  document.getElementById("insertAll").style.display = "none";
};
