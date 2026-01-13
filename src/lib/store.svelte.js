import { get, post } from "$lib/server";

// Авторизация
export const _auth = $state({
    is_authenticated: false,
    auth_error: "",
    user: {},
    is_loading: true,
});

// Функция для инициализации аутентификации
export const init_auth = async () => {
    _auth.is_loading = true;
    const token = localStorage.getItem('token');
    
    if (!token) {
        _auth.is_loading = false;
        return;
    }
    
    try {
        // Проверяем токен
        const data = await post("auth", {token});
        if (data.result === false) {
            localStorage.removeItem('token');
        } else {
            _auth.user = data;
            _auth.is_authenticated = data.active || false;
            const res = await get("site_settings");
            _site_settings.list = res
            _site_settings.loading = true
        }
    } catch (error) {
        console.error("Auth init error:", error);
    } finally {
        _auth.is_loading = false;
    }
};

export const _city = typeof localStorage !== 'undefined' ? localStorage.getItem('city') ?? 'chelyabinsk' : 'chelyabinsk';

export const _products_iiko = $state({
    list: [],
    loading: true,
});

// Настройки
export const _site_settings = $state({
    list: [],
    loading: false,
    error: "",
});

// Конфигурация
export const _config = $state({
    fudo_api: 'fudoapi.ru/v2/',
    api_path: 'fudogroup.ru/v1/',
    img_api: "local:///",
    api_tools: 'fudotools.ru/'
});