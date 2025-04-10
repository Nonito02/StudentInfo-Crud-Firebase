// Global variables
let nameV, courseV, statusV;

// Firebase reference
const studentRef = firebase.database().ref("student");

// Utility: Read form inputs
function readForm() {
  nameV = document.getElementById("name").value.trim();
  courseV = document.getElementById("course").value.trim();
  statusV = document.getElementById("status").value.trim();
}

// Utility: Clear form inputs
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("course").value = "";
  document.getElementById("status").value = "";
}

// Utility: Add student row to table
function addStudentRow(student) {
  const tableBody = document.getElementById("studentTableBody");
  const row = tableBody.insertRow();

  row.insertCell(0).innerText = student.name;
  row.insertCell(1).innerText = student.course;
  row.insertCell(2).innerText = student.status;
}

// INSERT
document.getElementById("insert").onclick = async function () {
  readForm();
  if (!nameV || !courseV || !statusV) return alert("All fields are required.");

  try {
    const snapshot = await studentRef.orderByChild("name").equalTo(nameV).once("value");
    if (snapshot.exists()) {
      alert("This student is already on the list.");
    } else {
      await studentRef.push({ name: nameV, course: courseV, status: statusV });
      alert("Data Inserted");
      clearForm();
    }
  } catch (error) {
    console.error(error);
    alert("Failed to insert data.");
  }
};

// READ
document.getElementById("read").onclick = async function () {
  readForm();
  if (!nameV) return alert("Please enter a name to search.");

  try {
    const snapshot = await studentRef.orderByChild("name").equalTo(nameV).once("value");
    if (snapshot.exists()) {
      snapshot.forEach(data => {
        const student = data.val();
        document.getElementById("course").value = student.course;
        document.getElementById("status").value = student.status;
      });
      alert("Data Retrieved");
    } else {
      alert("No student found with the provided name.");
    }
  } catch (error) {
    console.error("Read error:", error);
  }
};

// UPDATE
document.getElementById("update").onclick = async function () {
  readForm();
  if (!nameV) return alert("Please enter a name to update.");

  try {
    const snapshot = await studentRef.orderByChild("name").equalTo(nameV).once("value");
    if (snapshot.exists()) {
      snapshot.forEach(data => {
        data.ref.update({ course: courseV, status: statusV });
      });
      alert("Data Updated");
      clearForm();
    } else {
      alert("Student not found.");
    }
  } catch (error) {
    console.error("Update error:", error);
  }
};

// DELETE
document.getElementById("delete").onclick = async function () {
  readForm();
  if (!nameV) return alert("Please enter a name to delete.");

  try {
    const snapshot = await studentRef.orderByChild("name").equalTo(nameV).once("value");
    if (snapshot.exists()) {
      snapshot.forEach(data => data.ref.remove());
      alert("Data Deleted");
      clearForm();
    } else {
      alert("Student not found.");
    }
  } catch (error) {
    console.error("Delete error:", error);
  }
};

// SHOW ALL STUDENTS IN TABLE
document.getElementById("showStudents").onclick = function () {
  clearForm();
  const tableBody = document.getElementById("studentTableBody");
  tableBody.innerHTML = "";

  studentRef.once("value", function (snapshot) {
    const students = snapshot.val();
    if (students) {
      Object.values(students).forEach(addStudentRow);
    } else {
      alert("No student records found.");
    }
  });
};

// EXPORT TO EXCEL
document.getElementById("exportToExcel").onclick = function () {
  const table = document.getElementById("studentTableBody");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Students" });
  XLSX.writeFile(wb, "students.xlsx");
};

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
        tableBody.innerHTML = "";

        students.forEach(student => {
          if (student.name && student.course && student.status) {
            studentRef.push(student);
            addStudentRow(student);
          }
        });

        alert("CSV data imported successfully!");
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
