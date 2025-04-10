var nameV, courseV, statusV;

// Read form values
function readForm() {
  nameV = document.getElementById("name").value;
  courseV = document.getElementById("course").value;
  statusV = document.getElementById("status").value;
  console.log(nameV, courseV, statusV);
}

// INSERT
document.getElementById("insert").onclick = function () {
  readForm();

  var studentRef = firebase.database().ref("students").orderByChild("name").equalTo(nameV);
  studentRef.once("value").then(function(snapshot) {
    if (snapshot.exists()) {
      alert("This student is already on the list.");
    } else {
      var newStudentRef = firebase.database().ref("students").push(); // Changed to "students"
      newStudentRef.set({
        name: nameV,
        course: courseV,
        status: statusV
      });
      alert("Data Inserted");

      clearForm();
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
    });
};

// SHOW STUDENTS IN TABLE
document.getElementById("showStudents").onclick = function () {
  // Clear form inputs
  clearForm();

  // Clear existing table body
  document.getElementById("studentTableBody").innerHTML = "";

  var studentRef = firebase.database().ref("students"); // Changed to "students"

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
};

// EXPORT TO EXCEL
document.getElementById("exportToExcel").onclick = function () {
  var table = document.getElementById("studentTableBody");
  var wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
  XLSX.writeFile(wb, "students.xlsx");
};

// Clear form function
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("course").value = "";
  document.getElementById("status").value = "";
}

// Import function for CSV file
document.getElementById("importData").onclick = function () {
  var fileInput = document.getElementById("importFile");

  if (fileInput.files.length === 0) {
    alert("Please select a file to import.");
    return;
  }

  var file = fileInput.files[0];

  // Read the file using FileReader
  var reader = new FileReader();
  reader.onload = function (e) {
    var csvData = e.target.result;

    // Parse the CSV data using PapaParse
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        // Insert the parsed data into Firebase
        var students = results.data;

        students.forEach(function (student) {
          if (student.name && student.course && student.status) {
            var newStudentRef = firebase.database().ref("students").push(); // Changed to "students"
            newStudentRef.set({
              name: student.name,
              course: student.course,
              status: student.status
            });
          }
        });

        alert("Data imported successfully!");
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

  reader.readAsText(file); // Read the file as text
};

// Function to display students and include a checkbox for each row
function displayStudents(students) {
  const tableBody = document.getElementById("studentTableBody");
  tableBody.innerHTML = ""; // Clear existing rows

  if (students) {
    for (const key in students) {
      const student = students[key];
      const row = tableBody.insertRow();
      
      row.innerHTML = `
        <td><input type="checkbox" class="selectStudent" data-key="${key}" /></td>
        <td>${student.name || "N/A"}</td>
        <td>${student.course || "N/A"}</td>
        <td>${student.status || "Pending"}</td>
      `;
    }
  } else {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center;">
          <p>No students found</p>
        </td>
      </tr>
    `;
  }
}

// Select/Deselect all checkboxes
document.getElementById("selectAll").addEventListener("change", function () {
  const checkboxes = document.querySelectorAll(".selectStudent");
  checkboxes.forEach(checkbox => {
    checkbox.checked = this.checked;
  });
});

// Delete selected students
document.getElementById("deleteSelected").addEventListener("click", function () {
  const checkboxes = document.querySelectorAll(".selectStudent:checked");
  const keysToDelete = [];
  
  checkboxes.forEach(checkbox => {
    keysToDelete.push(checkbox.dataset.key);
  });

  if (keysToDelete.length > 0) {
    // Delete from Firebase
    keysToDelete.forEach(key => {
      firebase.database().ref("students").child(key).remove()
        .then(() => {
          console.log(`Student with ID ${key} deleted.`);
        })
        .catch(error => {
          console.error("Error deleting student:", error);
        });
    });
    
    // Refresh the student list
    displayStudents();
  } else {
    alert("Please select at least one student to delete.");
  }
});

// Function to fetch and display students
document.getElementById("showStudents").addEventListener("click", function () {
  firebase.database().ref("students").once("value")
    .then(snapshot => {
      const students = snapshot.val();
      displayStudents(students);
    })
    .catch(error => {
      console.error("Error fetching students:", error);
    });
});

