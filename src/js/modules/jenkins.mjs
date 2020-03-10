import {Toast} from "./sweet.mjs";

const jenkinsBuildUrl = '[!http://jenkins.tyre24.local:8080/buildStatus/icon?job={job}&build={build}&style=flat-square&subject={name}!|http://jenkins.tyre24.local:8080/view/{type}/job/{job}/{build}/]';

let embeddableUrl = document.querySelector('[data-jenkins-url]');
let copyBtn = document.querySelector('[data-copy="jenkins-url"]');
let job = document.querySelector('[data-jenkins-jobs]');
let build = document.querySelector('[data-jenkins-build]');
let jobInput = document.querySelector('[list="jenkinsJobs"]');

const buildUrl = () => {
    let selected = document.querySelector(`#jenkinsJobs option[value="${jobInput.value}"]`);

    if ('' === build.value || null === selected) {
        embeddableUrl.value = '';
    } else {
        embeddableUrl.value = jenkinsBuildUrl.replace(new RegExp('\{type\}', 'g'), selected.getAttribute('data-type'));
        embeddableUrl.value = embeddableUrl.value.replace(new RegExp('\{job\}', 'g'), selected.getAttribute('data-job'));
        embeddableUrl.value = embeddableUrl.value.replace(new RegExp('\{name\}', 'g'), selected.value);
        embeddableUrl.value = embeddableUrl.value.replace(new RegExp('\{build\}', 'g'), build.value);
    }
};

export function init(pages) {
    for (let item of pages) {
        let option = document.createElement('option');
        option.value = item.name;
        option.setAttribute('data-type', item.type);
        option.setAttribute('data-job', item.job);
        job.appendChild(option);
    }

    jobInput.addEventListener('click', () => {
        jobInput.value = '';
    });

    jobInput.addEventListener('change', buildUrl);
    build.addEventListener('change', buildUrl);
    build.addEventListener('keyup', buildUrl);

    embeddableUrl.addEventListener('click', copy);
    copyBtn.addEventListener('click', copy);
}

const copy = () => {
    if ('' === embeddableUrl.value) {
        Toast.fire({
            icon: "error",
            title: "First fill out job and build number.",
            position: "bottom"
        });

        return;
    }

    embeddableUrl.select();
    document.execCommand('copy');
    window.getSelection().removeAllRanges();

    Toast.fire({
        icon: "success",
        title: "Copied to clipboard",
        position: "bottom"
    });
};
