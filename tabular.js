function format(d, id) {
  // `d` is the original data object for the row
  return (
    '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
    "<tr>" +
    "<td>Command Syntax:</td>" +
    "<td>" +
    d.command_syntax +
    "</td>" +
    "</tr>" +
    "<tr>" +
    "<td>Examples:</td>" +
    "<td>" +
    '<div id="' +
    id +
    '" class="redis-example-cli"' +
    "></div>" +
    "</td>" +
    "</tr>" +
    "</table>"
  );
}

$(document).ready(function () {
  var table = $("#table-cheatsheet").DataTable({
    orderCellsTop: true,
    fixedHeader: true,
    pageLength: 50,

    columns: [
      {
        className: "dt-control",
        orderable: false,
        data: null,
        defaultContent: "",
      },
      { data: "Category" },
      { data: "Command" },
      { data: "Description" },
      { data: "Time Complexity" },
      { data: "Availability" },
      { data: "ACL Categories" },
      //   { data: "Syntax" },
      //   { data: "Examples" },
    ],
    columnDefs: [{ className: "align-middle", targets: "_all" }],

    order: [[1, "asc"]],
    rowGroup: {
      dataSrc: "Category",
    },
  });

  const fileUrl = "Redis_Commands_Cheatsheet_ListExamples.csv";
  Papa.parse(fileUrl, {
    download: true,
    complete: function (result) {
      tbl = result.data;
      tbl.forEach((r) => {
        let row = document.createElement("tr");

        s = r.slice(0, -1);

        category_format = s[0];
        if (category_format == "BF") {
          category_format = "Bloom Filters";
        } else if (category_format == "CF") {
          category_format = "Cuckoo Filters";
        } else if (category_format == "CMS") {
          category_format = "Count-Min Sketch";
        }

        complexity = s[4];
        if (complexity == "") {
          complexity = "Check Documentation";
        } else if (complexity == "N/A") {
          complexity = "Check Documentation";
        }

        tx_list = {
          Category: category_format, // Category
          Command: '<a href="' + s[3] + '" target = "_blank">' + s[1] + "</a>", // Command with link
          Description: s[2], // Description
          "Time Complexity": complexity, // Time Complexity
          Availability: s[5], // Availability
          "ACL Categories": s[6], // ACL Category
          //   s[7], // Command Syntax
        };

        command_str = "";
        var cmd_list = [];
        r.slice(-1).forEach((e) => {
          if (JSON.parse(e)) {
            JSON.parse(e).forEach((c) => {
              command_str += c + "<br>";
              cmd_list.push(c);
            });
          }
        });

        r = table.row.add(tx_list).draw().node();
        r.setAttribute("examples-list", cmd_list);
        r.setAttribute("command-syntax", s[7]);
      });
    },
  });

  function render_cli_with_examples(list, id) {
    pre_command_list = "";
    list.split(",").forEach((ex) => {
      pre_command_list += ex + "\n";
    });

    dynamic_cli =
      `<form id="dynamic-cli" class="redis-cli ` +
      id +
      ` overflow-y-auto max-h-80">
      <pre>` +
      pre_command_list +
      `</pre>
      <div class="prompt">
        <input name="prompt" type="text" autocomplete="on" spellcheck="false" />
      </div>
    </form>`;

    var cli_obj = $($.parseHTML(dynamic_cli));

    $("#" + id).append(cli_obj);

    const cli = document.querySelector("form.redis-cli." + id);

    createCli(cli);
  }

  function cli_id(id) {
    var id_obj = $($.parseHTML(id));
    return id_obj
      .text()
      .split(/[\s\.]+/)
      .join("-");
  }

  // Add event listener for opening and closing details
  $("#table-cheatsheet tbody").on("click", "td.dt-control", function () {
    var tr = $(this).closest("tr");

    var row = table.row(tr);
    var examples_list = tr.attr("examples-list");
    var command_syntax = tr.attr("command-syntax");

    if (examples_list == "") {
      examples_list =
        "Please check the official documentation by clicking the link above";
    }

    child_object = { example: examples_list, command_syntax: command_syntax };

    if (row.child.isShown()) {
      // This row is already open - close it
      row.child.hide();
      tr.removeClass("shown");
    } else {
      // Open this row
      row.child(format(child_object, cli_id(row.data().Command))).show();
      tr.addClass("shown");
      render_cli_with_examples(examples_list, cli_id(row.data().Command));
    }
  });
});
