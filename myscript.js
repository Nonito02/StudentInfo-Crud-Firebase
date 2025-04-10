// Helper Functions
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("course").value = "";
  document.getElementById("status").value = "";
}

// Read form values
function readForm() {
  return {
    name: document.getElementById("name").value,
    course: document.getElementById("course").value,
    status: document.getElementById("status").value
  };
}

// Insert student data
function insertStudent() {
  const { name, course, status } = readForm();
  const studentRef = firebase.database().ref("students").orderByChild("name").equalTo(name);
  
  studentRef.once("value").then(function(snapshot) {
    if (snapshot.exists()) {
      alert("This student is already on the list.");
    } else {
      firebase.database().ref("students").push().set({
        name, course, status
      });
      alert("Data Inserted");
      clearForm();
      loadStudents(); // Automatically reload the table
    }
  }).catch(handleError);
}

// Update student data
function updateStudent() {
  const { name, course, status } = readForm();
  const studentRef = firebase.database().ref("students").orderByChild("name").equalTo(name);

  studentRef.once("value").then(function(snapshot) {
    snapshot.forEach(function(data) {
      data.ref.update({ course, status });
    });
    alert("Data Updated");
    clearForm();
    loadStudents(); // Automatically reload the table
  }).catch(handleError);
}

// Delete student data
function deleteStudent() {
  const { name } = readForm();
  const studentRef = firebase.database().ref("students").orderByChild("name").equalTo(name);

  studentRef.once("value").then(function(snapshot) {
    snapshot.forEach(function(data) {
      data.ref.remove();
    });
    alert("Data Deleted");
    clearForm();
    loadStudents(); // Automatically reload the table
  }).catch(handleError);
}

// Load and display students in table
function loadStudents() {
  document.getElementById("studentTableBody").innerHTML = "";
  const studentRef = firebase.database().ref("students");

  studentRef.once("value", function(snapshot) {
    const students = snapshot.val();
    if (students) {
      const tableBody = document.getElementById("studentTableBody");
      for (const id in students) {
        const student = students[id];
        const row = tableBody.insertRow();
        row.innerHTML = `
          <td><input type="checkbox" class="studentCheckbox" data-id="${id}" /></td>
          <td>${student.name}</td>
          <td>${student.course}</td>
          <td>${student.status}</td>
        `;
      }
    } else {
      alert("No student records found.");
    }
  }).catch(handleError);
}

// Handle errors globally
function handleError(error) {
  console.error("Error: ", error);
  alert("An error occurred, please try again.");
}

// Export to Excel functionality
function exportToExcel() {
  const table = document.getElementById("studentTableBody");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
  XLSX.writeFile(wb, "students.xlsx");
}

// Import CSV Data
function importCSVData() {
  const fileInput = document.getElementById("importFile");

  if (fileInput.files.length === 0) {
    alert("Please select a file to import.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const csvData = e.target.result;
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function(results) {
        results.data.forEach(function(student) {
          if (student.name && student.course && student.status) {
            firebase.database().ref("students").push().set({
              name: student.name,
              course: student.course,
              status: student.status
            });
          }
        });
        alert("Data imported successfully!");
        loadStudents(); // Automatically reload the table
      },
      error: handleError
    });
  };

  reader.onerror = handleError;
  reader.readAsText(file); // Read the file as text
}

// Import Excel Data
function importExcelData() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an Excel file to import.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: "binary" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const studentsData = XLSX.utils.sheet_to_json(sheet);

    const tableBody = document.getElementById("studentTableBody");
    tableBody.innerHTML = ""; // Clear existing table rows

    if (studentsData.length > 0) {
      studentsData.forEach(student => {
        const row = tableBody.insertRow();
        row.innerHTML = `
          <td><input type="checkbox" class="studentCheckbox" data-id="${student.id || ''}" /></td>
          <td>${student['Full Name'] || ''}</td>
          <td>${student['Course'] || ''}</td>
          <td>${student['Status'] || ''}</td>
        `;
      });
      alert("Data imported successfully!");
    } else {
      alert("No data found in the Excel file.");
    }
  };

  reader.onerror = handleError;
  reader.readAsBinaryString(file); // Read file as binary string
}

// Attach event listeners to buttons
document.getElementById("insert").addEventListener("click", insertStudent);
document.getElementById("update").addEventListener("click", updateStudent);
document.getElementById("delete").addEventListener("click", deleteStudent);
document.getElementById("showStudents").addEventListener("click", loadStudents);
document.getElementById("exportToExcel").addEventListener("click", exportToExcel);
document.getElementById("importData").addEventListener("click", importCSVData);

// Initial load of students
loadStudents();
