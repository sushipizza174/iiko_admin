import { _config } from "$lib/store.svelte.js";

export const post = async (endpoint, data, base_url = _config.fudo_api) => {
    const res = await fetch("https://" + base_url + endpoint, {
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

export const put = async (endpoint, data, base_url = _config.fudo_api) => {
    const res = await fetch("https://" + base_url + endpoint, {
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

export const get = async (endpoint, base_url = _config.fudo_api) => {
    const res = await fetch("https://" + base_url + endpoint, {
        method: "GET",
        headers: {
            ...(localStorage.getItem("token") && {
                Authorization: "Bearer" + " " + localStorage.getItem("token"),
            }),
        },
    });
    return await res.json();
};

// export const delet = async (endpoint, filename, base_url = _config.fudo_api) => {
//     const res = await fetch("https://" + base_url + endpoint, {
//         method: 'DELETE',  
//         headers: {
//             'Content-Type': 'application/json',
//             ...(localStorage.getItem("token") && {
//                 Authorization: "Bearer" + " " + localStorage.getItem("token"),
//             }),
//         },
//         body: JSON.stringify({filename}),
//         keepalive: false 
//     });
//     return await res.json();
// };