import { get, post } from "$lib/server";

// Авторизация
export const _auth = $state({
    is_authenticated: false,
    auth_error: "",
    user: {},
});

export const _city = typeof localStorage !== 'undefined' ? localStorage.getItem('city') ?? 'chelyabinsk' : 'chelyabinsk';

export const _products_iiko = $state({
    list: [],
    loading: true,
});

export const load_products = async (city) => {
    try {
        const data = await get(`products?city=${city}`);
        _products_iiko.list = Array.isArray(data) ? data : [];
        _products_iiko.loading = false
    } catch (e) {
        console.error("Ошибка загрузки офисов:", e);
        _products_iiko.list = [];
    }
};

// Настройки
export const _site_settings = $state({
    list: [],
    loading: false,
    error: "",
});

export const load_settings = async () => {
    _site_settings.loading = true;
    _site_settings.error = "";

    try {
        const data = await get("crm_settings");
        _site_settings.list = Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Ошибка загрузки настроек:", e);
        _site_settings.error = e.message || "Ошибка загрузки настроек";
    } finally {

        _site_settings.loading = false;
    }
};

// Конфигурация
export const _config = $state({
    fudo_api: 'fudoapi.ru/v2/',
    api_path: 'fudogroup.ru/v1/',
    img_api: "local:///",
    api_tools: 'fudotools.ru/'
});