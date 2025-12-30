import { _config} from "$lib/store.svelte.js";

const get_base_url = () => {
    // const hostname = window.location.hostname;

    // if (hostname === 'supio.ru') {
    //     return _config.prod_api;
    // }
    return _config.fudo_api;
};

export const post = async (endpoint, data) => {
    const res = await fetch("https://" + get_base_url() + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token") && {
                Authorization: "Bearer" + " " + localStorage.getItem("token"),
            }),
        },
        body: JSON.stringify(data),
    });
    return await res.json();
};

export const put = async (endpoint, data) => {
    const res = await fetch("https://" + get_base_url() + endpoint, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token") && {
                Authorization: "Bearer" + " " + localStorage.getItem("token"),
            }),
        },
        body: JSON.stringify(data),
    });
    return await res.json();
};

export const get = async (endpoint) => {
    const res = await fetch("https://" + get_base_url() + endpoint, {
        method: "GET",
        headers: {
            ...(localStorage.getItem("token") && {
                Authorization: "Bearer" + " " + localStorage.getItem("token"),
            }),
        },
    });
    return await res.json();
};

export const delet = async (endpoint) => {
    const res = await fetch("https://" + get_base_url() + endpoint, {
        method: 'DELETE',  
        headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem("token") && {
                Authorization: "Bearer" + " " + localStorage.getItem("token"),
            }),
        },
        keepalive: false 
    });
    return await res.json();
};
