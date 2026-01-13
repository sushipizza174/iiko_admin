// Утилиты для работы с данными
export const helpers = {
    imgproxy_path: (file, width, height) => {
		`https://fudomedia.ru/insecure/rs:fill:${width}:${height}/g:sm/format:webp/${btoa(`local:///${file}`)}`
    },
    delete_img: (filename) => {
        fetch(`https://fudoadmin.ru/api/image?key=UHCowkgAEk63vXn62LHmYov`, { 
            method: 'DELETE',  
            headers: {
                "Content-Type": "application/json",
                ...(localStorage.getItem("token") && {
                    Authorization: "Bearer" + " " + localStorage.getItem("token"),
                }),
            },
            body: JSON.stringify({filename}),
            keepalive: false 
        })
        .catch(error => { console.log(error) });
    }
};