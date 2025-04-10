document.addEventListener("DOMContentLoaded", () => {
  var nameV, courseV, statusV;

  // Read form values
  function readForm() {
    nameV = document.getElementById("name").value.trim();
    courseV = document.getElementById("course").value.trim();
    statusV = document.getElementById("status").value.trim();
    console.log(nameV, courseV, statusV);
  }

  // Clear form fields
  function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("course").value = "";
    document.getElementById("status").value = "";
  }

  // INSERT
  document.getElementById("insert")?.addEventListener("click", function () {
    readForm();
    var studentRef = firebase.database().ref("students").orderByChild("name").equalTo(nameV);
    studentRef.once("value").then(function (snapshot) {
      if (snapshot.exists()) {
        alert("This student is already on the list.");
      } else {
        firebase.database().ref("students").push().set({
          name: nameV,
          course: courseV,
          status: statusV
        }).then(() => {
          alert("Data Inserted");
          clearForm();
          loadStudents();
        });
      }
    });
  });

  // READ
  document.getElementById("read")?.addEventListener("click", function () {
    readForm();
    firebase.database().ref("students").orderByChild("name").equalTo(nameV).once("value")
      .then(snapshot => {
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
      });
  });

  // UPDATE
  document.getElementById("update")?.addEventListener("click", function () {
    readForm();
    firebase.database().ref("students").orderByChild("name").equalTo(nameV).once("value")
      .then(snapshot => {
        if (snapshot.exists()) {
          snapshot.forEach(data => {
            data.ref.update({
              course: courseV,
              status: statusV
            });
          });
          alert("Data Updated");
          clearForm();
          loadStudents();
        } else {
          alert("No matching student to update.");
        }
      });
  });

  // DELETE
  document.getElementById("delete")?.addEventListener("click", function () {
    readForm();
    firebase.database().ref("students").orderByChild("name").equalTo(nameV).once("value")
      .then(snapshot => {
        if (snapshot.exists()) {
          snapshot.forEach(data => data.ref.remove());
          alert("Data Deleted");
          clearForm();
          loadStudents();
        } else {
          alert("No matching student to delete.");
        }
      });
  });

  // Export to Excel
  document.getElementById("exportToExcel")?.addEventListener("click", function () {
    var table = document.getElementById("studentTable");
    if (!table) return alert("Table not found!");
    var wb = XLSX.utils.table_to_book(table, { sheet: "Students" });
    XLSX.writeFile(wb, "students.xlsx");
  });

  // Import CSV
  document.getElementById("importData")?.addEventListener("click", function () {
    var fileInput = document.getElementById("importFile");
    if (fileInput.files.length === 0) {
      alert("Please select a file to import.");
      return;
    }

    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
      Papa.parse(e.target.result, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          results.data.forEach(student => {
            if (student.name && student.course && student.status) {
              firebase.database().ref("students").push().set({
                name: student.name,
                course: student.course,
                status: student.status
              });
            }
          });
          alert("Data imported successfully!");
          loadStudents();
        }
      });
    };

    reader.readAsText(file);
  });

  // Display students
  function displayStudents(students) {
    const tableBody = document.getElementById("studentTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (students) {
      Object.entries(students).forEach(([key, student]) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
          <td><input type="checkbox" class="selectStudent" data-key="${key}"></td>
          <td>${student.name || "N/A"}</td>
          <td>${student.course || "N/A"}</td>
          <td>${student.status || "Pending"}</td>
        `;
      });
    } else {
      const row = tableBody.insertRow();
      row.innerHTML = `
        <td colspan="4" style="text-align: center;">No students found</td>
      `;
    }
  }

  // Load and display students
  function loadStudents() {
    firebase.database().ref("students").once("value")
      .then(snapshot => {
        displayStudents(snapshot.val());
      })
      .catch(error => {
        console.error("Error fetching students:", error);
      });
  }

  // Show students
  document.getElementById("showStudents")?.addEventListener("click", loadStudents);

  // Select all checkboxes
  document.getElementById("selectAll")?.addEventListener("change", function () {
    document.querySelectorAll(".selectStudent").forEach(checkbox => {
      checkbox.checked = this.checked;
    });
  });

  // Delete selected students
  document.getElementById("deleteSelected")?.addEventListener("click", function () {
    const selected = document.querySelectorAll(".selectStudent:checked");
    const keys = Array.from(selected).map(cb => cb.dataset.key);

    if (keys.length === 0) {
      alert("Please select at least one student to delete.");
      return;
    }

    Promise.all(
      keys.map(key =>
        firebase.database().ref("students").child(key).remove()
          .catch(error => console.error("Error deleting student:", error))
      )
    ).then(() => {
      alert("Selected students deleted.");
      loadStudents();
    });
  });

  // Initial load
  loadStudents();
});
