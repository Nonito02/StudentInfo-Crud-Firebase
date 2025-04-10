// Define global variables
var nameV, courseV, statusV;

// Read form values
function readForm() {
  nameV = document.getElementById("name").value;
  courseV = document.getElementById("course").value;
  statusV = document.getElementById("status").value;
  console.log(nameV, courseV, statusV);
}

// Clear form inputs
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("course").value = "";
  document.getElementById("status").value = "";
}

// Show students in table (used both for button and after import)
function showStudentTable() {
  clearForm();
  document.getElementById("studentTableBody").innerHTML = "";

  var studentRef = firebase.database().ref("students");

  studentRef.once("value", function(snapshot) {
    var students = snapshot.val();
    if (students) {
      var tableBody = document.getElementById("studentTableBody");
      for (var id in students) {
        var student = students[id];
        var row = tableBody.insertRow();

        var cell1 = row.insertCell(0); // Name
        var cell2 = row.insertCell(1); // Course
        var cell3 = row.insertCell(2); // Status

        cell1.innerHTML = student.name;
        cell2.innerHTML = student.course;
        cell3.innerHTML = student.status;
      }
    } else {
      alert("No student records found.");
    }
  });
}

// INSERT
document.getElementById("insert").onclick = function () {
  readForm();
  var studentRef = firebase.database().ref("students").orderByChild("name").equalTo(nameV);
  studentRef.once("value").then(function(snapshot) {
    if (snapshot.exists()) {
      alert("This student is already on the list.");
    } else {
      var newStudentRef = firebase.database().ref("students").push();
      newStudentRef.set({
        name: nameV,
        course: courseV,
        status: statusV
      });
      alert("Data Inserted");
      clearForm();
      showStudentTable(); // Refresh table
    }
  });
};

// READ
document.getElementById("read").onclick = function () {
  readForm();
  firebase.database().ref("students").orderByChild("name").equalTo(nameV).once("value")
    .then(function(snapshot) {
      var data = snapshot.val();
      if (data) {
        for (var key in data) {
          var student = data[key];
          document.getElementById("course").value = student.course;
          document.getElementById("status").value = student.status;
        }
        alert("Data Retrieved");
      } else {
        alert("No student found with the provided name.");
      }
    })
    .catch(function(error) {
      console.error("Error retrieving data: ", error);
    });
};

// UPDATE
document.getElementById("update").onclick = function () {
  readForm();
  firebase.database().ref("students").orderByChild("name").equalTo(nameV).once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(data) {
        data.ref.update({
          course: courseV,
          status: statusV
        });
      });
      alert("Data Updated");
      clearForm();
      showStudentTable(); // Refresh table
    });
};

// DELETE
document.getElementById("delete").onclick = function () {
  readForm();
  firebase.database().ref("students").orderByChild("name").equalTo(nameV).once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(data) {
        data.ref.remove();
      });
      alert("Data Deleted");
      clearForm();
      showStudentTable(); // Refresh table
    });
};

// SHOW STUDENTS IN TABLE
document.getElementById("showStudents").onclick = showStudentTable;

// EXPORT TO EXCEL
document.getElementById("exportToExcel").onclick = function () {
  var table = document.getElementById("studentTableBody");
  var wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
  XLSX.writeFile(wb, "students.xlsx");
};

// IMPORT CSV AND DISPLAY
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

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        var students = results.data;

        students.forEach(function (student) {
          if (student.name && student.course && student.status) {
            var newStudentRef = firebase.database().ref("students").push();
            newStudentRef.set({
              name: student.name,
              course: student.course,
              status: student.status
            });
          }
        });

        alert("Data imported successfully!");
        showStudentTable(); // ✅ Automatically show the new data in the table
      },
      error: function (error) {
        console.error("Error parsing CSV:", error);
        alert("There was an error processing the file.");
      }
    });
  };

  reader.onerror = function (error) {
    console.error("Error reading file:", error);
    alert("There was an error reading the file.");
  };

  reader.readAsText(file);
};
