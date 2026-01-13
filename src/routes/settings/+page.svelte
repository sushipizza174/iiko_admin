<svelte:head>
	<title>Дополнительные настройки</title>
	<meta name="description" content="About this app" />
</svelte:head>

<script lang="ts">
    // @ts-nocheck
    import { onMount } from "svelte";
    import {_config, _site_settings, _city, _products_iiko} from "$lib/store.svelte.js"
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import Loader from "$lib/components/ui/Loader.svelte";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Separator } from "$lib/components/ui/separator";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import ScrollToTop from "../scroll_to_top.svelte";
    import { toast } from "svelte-sonner";
    import Sliders from "./components/Sliders.svelte";
    import SuggestedProductsIiko from "./components/SuggestedProductsIiko.svelte";
    import AttentionBonus from "./components/AttentionBonus.svelte";
    import Bonus from "./components/Bonus.svelte";
    import Delivery from "./components/Delivery.svelte";
    import PresentProducts from "./components/PresentProducts.svelte";
    import { XCircle, PlusCircle, Pencil, ChevronsUpDown, Check } from "@lucide/svelte";
    import { get, post } from "$lib/server";

    let site_settings_list = $derived(_site_settings.list || []);
	let products = $derived(_products_iiko.list || []);
	let page_is_loading = $state(false);
	let settings_page_is_loading = $state(false);

	let set_items = $derived(
           _site_settings.loading
            ? _site_settings.list.reduce((acc, s) => {
                  acc[s.id] = s.data;
                  return acc;
              }, {})
            : {}
    );

	let add_setting = $state({
		size_group: null,
		roll_category: null,
		roll_category_label: null,
		name_suggested_prod: null,
		name_suggested_prod_roll: null,
		present_product: {},
		price_for_present: null,
		name_birthday_prod: null
	});

	let edit_setting = $state(null);

	let open = $state({
		suggested_products: null,
		slider_city: null,
		delivery_city: null,
		delivery_type: null,
		bonus_city: null,
		bonus_type: null,
		attention_bonus_city: null
	});

    const imgproxy_path = (file, width, height) => `https://fudomedia.ru/insecure/rs:fill:${width}:${height}/g:sm/format:webp/${btoa(`${_config.img_api}${file}`)}`;

    let city = $derived(_city || 'chelyabinsk');
    let city_name = $derived(
		set_items.city?.find(c => c.id === city)?.name || 'Челябинск'
	);


    onMount( async () => {
        try {
            const data = await get(`products?city=${_city}&type=prod`);
            _products_iiko.list = Array.isArray(data) ? data : [];
            _products_iiko.loading = false
        } catch (e) {
            console.error("Ошибка загрузки:", e);
            _products_iiko.list = [];
        }
    })

    // функция для работы с доп настройками
    const edit_site_settings = async (setting_name, new_setting, index_to_delete, index_to_edit) => {
        
        const scrollPosition = window.scrollY; // Сохранение текущей прокрутки
        settings_page_is_loading = true
        let exist_setting = _site_settings.list.find(set => set.id == setting_name)
        
        let request_body
        if (index_to_delete !== null && index_to_delete !== undefined) {
            // Если передан index_to_delete, удаляем запись по этому индексу
            if (exist_setting) {
                exist_setting.data.splice(index_to_delete, 1);
                request_body = { id: setting_name, data: exist_setting.data };
            } else {
                settings_page_is_loading = false
                return;
            }
        } else if (index_to_edit !== null && index_to_edit !== undefined) {
            // Если передан index_to_edit, редактируем запись по этому индексу
            exist_setting.data = exist_setting.data.map((item, index) => {
                return index === index_to_edit ? new_setting : item
            });
            request_body = { id: setting_name, data: exist_setting.data };
            settings_page_is_loading = false

        } else {
            // Если index_to_delete и index_to_edit не переданы, добавляем данные
            request_body = exist_setting
                ? { id: setting_name, data: [...exist_setting.data, new_setting] }
                : { id: setting_name, data: [new_setting] }; // Если exist_setting отсутствует
        }

        try {
            const data = post ('site_settings', request_body)
            if (data.error) throw new Error(data.error);
            _site_settings.loading = false
            const res = await get("site_settings");
            _site_settings.list = res
            _site_settings.loading = true
            requestAnimationFrame(() => window.scrollTo(0, scrollPosition));

            //уточнить, скорее всего будет fudo_api
            // fetch(`https://${_config.api_path}options`, { 
            //     method:'POST',  
            //     headers: { 'Content-Type': 'application/json' }, 
            //     body: JSON.stringify({type:'version', value: Math.floor(Date.now() / 1000)}),
            //     keepalive: false 
            // }).then(response => {
            //     // console.log('add version')
            // })
        } catch (e) {
            toast.warning("Ошибка!", {
                description: `Попробуйте ещё раз.`,
                action: { label: "Закрыть",	 onClick: () => console.info("") },
                position: 'top-right',
            })
        } finally {
            settings_page_is_loading = false
        }

        for (const key in add_setting) {
            add_setting[key] = null;
        }
    }

</script>

<section class="h-full w-full flex flex-col justify-start mt-8">

    {#if settings_page_is_loading || !_site_settings.loading} 
		<div class="w-full h-full bg-white z-10 my-auto flex flex-col justify-center items-center absolute top-0 left-0">
			<Loader/>
		</div>
	{:else}

	<div class="flex items-center gap-2 pb-5 border-b px-4 text-sm text-center">
		<a href="#img_sliders" class="hover:underline">Картинки для слайдера</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#suggested_products" class="hover:underline">Дополнительные товары</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#delivery" class="hover:underline">Информация о доставке</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#bonus" class="hover:underline">Акции и новости</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#attention_bonus" class="hover:underline">Блок "Внимание" для акций</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#present_products" class="hover:underline">Подарки на акции</a>
	</div>

	
	<div class="mx-4 mt-5">
		<p class="font-semibold text-xl">Дополнительные настройки</p>

		<!-- Картинки для слайдера -->
		<Sliders {city_name} {city} {edit_site_settings} />

		<!-- Дополнительные товары IIKO -->
		<Separator />
		<SuggestedProductsIiko {city_name} {city} {edit_site_settings} />

		<!-- Информация о доставке -->
		<Separator />
		<Delivery {city_name} {city} {edit_site_settings} />

		<!-- Акции и новости -->
		<Separator />
		<Bonus {city_name} {city} {edit_site_settings} />

		<!-- Блок Внимание для акций -->
		<Separator />
		<AttentionBonus {city_name} {city} {edit_site_settings} />

		<!-- Подарки на акции -->
		<Separator />
		<PresentProducts {city_name} {city} {edit_site_settings} />

	</div>
	{/if}

<ScrollToTop />
</section>

<style>
	html {
  		scroll-behavior: smooth;
	}
</style>