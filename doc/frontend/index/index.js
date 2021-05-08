(function() {
    window.supportDrag = (function() {
        let div = document.createElement("div");
        return (
            ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
            "FormData" in window &&
            "FileReader" in window
        );
    })();

    function parseToRow(key, label, value) {
        let row = '';
        row = row.concat(
            '<tr>',
            '<th scope="row">',
            key.toString(),
            '</th>',
            '<th scope="row">',
            label,
            '</th>',
            '<th scope="row">',
            value,
            '</th>',
            '</tr>'
        )
        return row
    }

    function resultHandler(data) {
        $("#carousel-container").carousel("next");
        let lines = data.split("\n");
        let result = lines[lines.length - 2];
        result = JSON.parse(result);
        let key = 1;
        for (label in result) {
            $('tbody').append(parseToRow(key++, label, result[label]))
        }
    }

    function uploadHandler() {
        var file = this.files[0];
        var reader = new FileReader();
        document.getElementById("js-file-name").innerHTML = file.name;

        $(".file-content").fadeTo("fast", 0.2);
        $(".file-wrapper").fadeTo("fast", 0.9);
        document.getElementById('preloader').removeAttribute("hidden");

        let input = document.getElementById("js-file-input");
        input.setAttribute("disabled", "disabled");
        input.removeEventListener("change", uploadHandler)
        toggleActiveAnimation(input, false);
        document
            .querySelectorAll(".file-input")[0]
            .classList.remove("file-input--active");

        reader.onloadend = function() {
            source = reader.result;
            $('#file-output').attr('src', source);
            var imagebase64 = source.split(',');
            imagebase64 = imagebase64[1];
            $.ajax({
                    url: './clip',
                    type: 'POST',
                    data: imagebase64
                })
                .done(resultHandler)
                .fail(function(data) {
                    console.log("error");
                });
        }
        reader.readAsDataURL(file);
    }

    function dragenterHandler() {
        document
            .querySelectorAll(".file-input")[0]
            .classList.add("file-input--active");
    }

    function dragleaveHandler() {
        document
            .querySelectorAll(".file-input")[0]
            .classList.remove("file-input--active");
    }

    function toggleActiveAnimation(input, toggle) {
        if (supportDrag) {
            if (toggle) {
                input.addEventListener("dragenter", dragenterHandler);
                input.addEventListener("dragleave", dragleaveHandler);
            } else {
                input.removeEventListener("dragenter", dragenterHandler);
                input.removeEventListener("dragleave", dragleaveHandler);
            }
        }
    }

    function initialize() {
        let input = document.getElementById("js-file-input");

        input.addEventListener("change", uploadHandler, false);
        if (supportDrag) {
            toggleActiveAnimation(input, true);
        } else {
            document.querySelectorAll(".has-drag")[0].classList.remove("has-drag");
        }
    }

    window.onload = function() {

        $("#carousel-container").carousel();

        $("#start-btn").click(function() {
            $("#carousel-container").carousel("next");
        });

        $("#reload-btn").click(function() {
            $("#carousel-container").carousel(0);
            $(".file-content").fadeTo("fast", 1);
            $(".file-wrapper").fadeTo("fast", 1);
            $('#file-output').removeAttr('src');
            $('tbody').empty();
            document.getElementById('preloader').setAttribute("hidden", true);
            document.getElementById("js-file-input").removeAttribute("disabled", "disabled");
            document.getElementById("js-file-name").innerHTML = '';
            document.getElementById('js-file-input').value = "";
            initialize();
        });

        initialize();

    }

})();