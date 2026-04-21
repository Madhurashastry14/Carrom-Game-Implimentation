 document.querySelector(".moreoption").onclick = function() {
                let morefind = document.querySelector(".more");
                if (morefind.style.display === "none" || morefind.style.display === "") {
                    morefind.style.display = "block";
                }
                else
                {
                    morefind.style.display = "none";
                }
            }