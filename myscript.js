<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>

<script>
  // 🔧 Your Firebase configuration
  var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DB_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  firebase.initializeApp(firebaseConfig);

  var nameV, courseV, statusV;

  function readForm() {
    nameV = document.getElementById("name").value;
    courseV = document.getElementById("course").value;
    statusV = document.getElementById("status").value;
    console.log(nameV, courseV, statusV);
  }

  document.getElementById("insert").onclick = function () {
    readForm();
    var studentRef = firebase.database().ref("student").orderByChild("name").equalTo(nameV);
    studentRef.once("value").then(function(snapshot) {
      if (snapshot.exists()) {
        alert("This student is already on the list.");
      } else {
        var newStudentRef = firebase.database().ref("student").push();
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

  document.getElementById("read").onclick = function () {
    readForm();
    firebase.database().ref("student").orderByChild("name").equalTo(nameV).once("value")
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

  document.getElementById("update").onclick = function () {
    readForm();
    firebase.database().ref("student").orderByChild("name").equalTo(nameV).once("value")
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

  document.getElementById("delete").onclick = function () {
    readForm();
    firebase.database().ref("student").orderByChild("name").equalTo(nameV).once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(data) {
          data.ref.remove();
        });
        alert("Data Deleted");
        clearForm();
      });
  };

  document.getElementById("showStudents").onclick = function () {
    clearForm();
    document.getElementById("studentTableBody").innerHTML = "";
    var studentRef = firebase.database().ref("student");
    studentRef.once("value", function(snapshot) {
      var students = snapshot.val();
      if (students) {
        var tableBody = document.getElementById("studentTableBody");
        for (var id in students) {
          var student = students[id];
          var row = tableBody.insertRow();
          var cell1 = row.insertCell(0);
          var cell2 = row.insertCell(1);
          var cell3 = row.insertCell(2);
          cell1.innerHTML = student.name;
          cell2.innerHTML = student.course;
          cell3.innerHTML = student.status;
        }
      } else {
        alert("No student records found.");
      }
    });
  };

  document.getElementById("exportToExcel").onclick = function () {
    var table = document.getElementById("studentTableBody");
    var wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, "students.xlsx");
  };

  function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("course").value = "";
    document.getElementById("status").value = "";
  }

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
              var newStudentRef = firebase.database().ref("student").push();
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

    reader.readAsText(file);
  };
</script>
