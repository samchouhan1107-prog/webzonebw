document.addEventListener("DOMContentLoaded", function () {

    const skills = document.querySelectorAll(".skill-fill");

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if(entry.isIntersecting){

                entry.target.style.width =
                    entry.target.dataset.width + "%";

            }

        });

    }, {threshold:0.4});

    skills.forEach(skill => observer.observe(skill));

});