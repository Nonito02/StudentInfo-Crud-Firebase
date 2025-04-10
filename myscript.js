// Import function for CSV file
document.getElementById("importData").onclick = function () {
  var fileInput = document.getElementById("importFile");

  if (fileInput.files.length === 0) {
    alert("Please select a file to import.");
    return;
  }

  var file = fileInput.files[0];
  var reader = new FileReader();

  reader.onload = function (e) {
    var csvData = e.target.result;

    // Parse CSV using PapaParse
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        var students = results.data;

        // Clear table first
        document.getElementById("studentTableBody").innerHTML = "";

        students.forEach(function (student) {
          // Check required fields
          if (student.name && student.course && student.status) {
            // Push to Firebase
            var newStudentRef = firebase.database().ref("student").push();
            newStudentRef.set({
              name: student.name,
              course: student.course,
              status: student.status
            });

            // Realtime update table
            var tableBody = document.getElementById("studentTableBody");
            var row = tableBody.insertRow();

            var cell1 = row.insertCell(0); // Name
            var cell2 = row.insertCell(1); // Course
            var cell3 = row.insertCell(2); // Status

            cell1.innerHTML = student.name;
            cell2.innerHTML = student.course;
            cell3.innerHTML = student.status;
          }
        });

        alert("CSV data imported and synced to Firebase successfully!");
      },
      error: function (error) {
        console.error("Error parsing CSV:", error);
        alert("Error processing the CSV file.");
      }
    });
  };

  reader.onerror = function (error) {
    console.error("Error reading file:", error);
    alert("Error reading the selected file.");
  };

  reader.readAsText(file);
};
