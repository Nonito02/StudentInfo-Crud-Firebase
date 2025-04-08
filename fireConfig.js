var firebaseConfig = {
  apiKey: "AIzaSyCqJUpVX0MYS5ZFl4Ji6JF6WHQyMwMR1xE",
  authDomain: "studentinfo-621f6.firebaseapp.com",
  databaseURL: "https://studentinfo-621f6-default-rtdb.firebaseio.com",
  projectId: "studentinfo-621f6",
  storageBucket: "studentinfo-621f6.appspot.com",
  messagingSenderId: "917260810120",
  appId: "1:917260810120:web:42ccf14db52b9658ddec3d"
};

firebase.initializeApp(firebaseConfig);

document.getElementById("export").onclick = function () {
  var studentRef = firebase.database().ref("student");

  studentRef.once("value", function (snapshot) {
    var students = snapshot.val();
    if (students) {
     
      var data = [];

      // Adding headers: Name, Course, and Status
      data.push(["Name", "Course", "Status"]);

      // Loop through the students and push the required fields (name, course, status)
      for (var rollNo in students) {
        var student = students[rollNo];
        data.push([student.name, student.course, student.status]);
      }

      // Create worksheet from the data array
      var ws = XLSX.utils.aoa_to_sheet(data);

      // Create a new workbook and append the worksheet
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");

      // Export the workbook as an Excel file
      XLSX.writeFile(wb, "student_data.xlsx");
    } else {
      alert("No student records found.");
    }
  });
};
