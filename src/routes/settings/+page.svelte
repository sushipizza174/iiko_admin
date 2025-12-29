<svelte:head>
	<title>Дополнительные настройки</title>
	<meta name="description" content="About this app" />
</svelte:head>

<script lang="ts">
// @ts-nocheck
import { beforeUpdate, onMount } from "svelte";
import {_store} from "../../core/_store"
import { Input } from "$lib/components/ui/input/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import * as Popover from "$lib/components/ui/popover/index.js";
import * as Command from "$lib/components/ui/command/index.js";
import CrossCircled from "svelte-radix/CrossCircled.svelte";
import PlusCircled from "svelte-radix/PlusCircled.svelte";
import Pencil2 from "svelte-radix/Pencil2.svelte";
import Loader from "$lib/components/ui/Loader.svelte";
import { Label } from "$lib/components/ui/label/index.js";
import { Separator } from "$lib/components/ui/separator";
import CaretSort from "svelte-radix/CaretSort.svelte";
import Check from "svelte-radix/Check.svelte";
import { cn } from "$lib/utils.js";
import { tick } from "svelte";
import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
import Textarea from "$lib/components/ui/textarea/textarea.svelte";
import * as Dialog from "$lib/components/ui/dialog";
import ScrollToTop from "../scroll_to_top.svelte";
import { toast } from "svelte-sonner";
import Sliders from "./components/Sliders.svelte";
import SuggestedProducts from "./components/SuggestedProducts.svelte";
import SuggestedProductsIiko from "./components/SuggestedProductsIiko.svelte";
import Filters from "./components/Filters.svelte";
import Marks from "./components/Marks.svelte";
import Modifiers from "./components/Modifiers.svelte";
import PresentProduct from "./components/PresentProduct.svelte";
import RollCategories from "./components/RollCategories.svelte";
import AttentionBonus from "./components/AttentionBonus.svelte";
import Bonus from "./components/Bonus.svelte";
import Delivery from "./components/Delivery.svelte";
import DishesSizes from "./components/DishesSizes.svelte";
import BirthdayProducts from "./components/BirthdayProducts.svelte";
import SuggestedProductsRoll from "./components/SuggestedProductsRoll.svelte";
import DeliveryPrice from "./components/DeliveryPrice.svelte";
import PresentProducts from "./components/PresentProducts.svelte";



let site_settings = [];
// let new_dishes_sizes = false;
let products = [];
let page_isLoading = false;
let set_items = {}


// инпуты в доп настройках
let add_setting = {
	size_group: null,
	roll_category: null,
	roll_category_label: null,
	name_suggested_prod: null,
	name_suggested_prod_roll: null,
	present_product: {},
	price_for_present: null,
	name_birthday_prod: null,
}

let edit_setting

let open = {
	suggested_products: null,
	slider_city: null,
	delivery_city: null,
	delivery_type: null,
	bonus_city: null,
	bonus_type: null,
	attention_bonus_city: null,
}

// const imgproxy_path = (file, width, height) => `https://spimageproxy.ru:443/insecure/rs:fill:${width}:${height}/g:sm/format:webp/${btoa(`${$_store.imgApi}${file}`)}`;
const imgproxy_path = (file, width, height) => `https://fudomedia.ru/insecure/rs:fill:${width}:${height}/g:sm/format:webp/${btoa(`${$_store.imgApi}${file}`)}`;

$: city = $_store.city || 'chelyabinsk'	// берет id city из localstorage
$: city_name = set_items?.city?.find(c => c.id == city)?.name || 'Челябинск' // ищет name города по id из localstorage


onMount( async () => {
	
	set_items.modifiers_id = $_store.site_settings.find(s=> s.id === "modifiers_id")?.data

	// добавление в settings модификаторов из ТП
	try {
		const response = await fetch(`${$_store.api_path}/admin_tp_menu?city=${city == 'kopeysk' ? 'chelyabinsk' : city}`);
		if (!response.ok) { throw new Error('Network response was not ok') }
		const res = await response.json();
		_store.val('tp_products', res);
		let modifiers_id = res.filter(p => ["Модификаторы", "Соусы к закускам"].includes(p.tp_data.mgrp_Name));
		let data = [];

		modifiers_id.map(m => {
			data.push({
				id: m.tp_data.mitm_ID,
				name: m.tp_data.mitm_Name,
				group: m.tp_data.mgrp_Name,
				city
			})
		})

		set_items.modifiers_id[0] = set_items.modifiers_id[0]?.filter(m => m.city !== city)
		set_items.modifiers_id = [...set_items.modifiers_id[0], ...data]
		
		// console.log(set_items.modifiers_id)
		edit_site_settings('modifiers_id', set_items.modifiers_id, null, 0);
	} catch (error) {
		console.error('Ошибка при загрузке данных: ', error);
	}

	try {
		const response = await fetch(`${$_store.api_path}/products?city=${city}&token=${localStorage.getItem('token')}`);
		if (!response.ok) { throw new Error('Network response was not ok') }
		const res = await response.json();
		_store.val('products', res);
		console.log(res)
	} catch (error) {
		console.error('Ошибка при загрузке данных: ', error);
	}

	if (!$_store.products_iiko.length) {
		try {
			const response = await fetch(`${$_store.fudo_api}/products?city=${city}&type=prod`);
			if (!response.ok) { throw new Error('Network response was not ok') }
			const res = await response.json();
			_store.val('products_iiko', res);
		} catch (error) {
			console.error('Ошибка при загрузке данных: ', error);
		}
	}
})

beforeUpdate(()=>{
	products = $_store.products || [];
	site_settings = $_store.site_settings || [];

	Init_SetIems()
})

const Init_SetIems = () => {
	if ($_store.load_settings) {
		set_items = site_settings.reduce((acc, s) => {
			acc[s.id] = s.data;
			return acc;
		}, {});
	}
}

// функция для работы с доп настройками
const edit_site_settings = async (setting_name, new_setting, index_to_delete, index_to_edit) => {
	
	const scrollPosition = window.scrollY; // Сохранение текущей прокрутки
	_store.val('settings_page_is_loading', true)
	let exist_setting = $_store.site_settings.find(set => set.id == setting_name)
	
	let requestBody
	if (index_to_delete !== null && index_to_delete !== undefined) {
		// Если передан index_to_delete, удаляем запись по этому индексу
		if (exist_setting) {
			exist_setting.data.splice(index_to_delete, 1);
			requestBody = { id: setting_name, data: exist_setting.data };
		} else {
			_store.val('settings_page_is_loading', false)
			return;
		}
	} else if (index_to_edit !== null && index_to_edit !== undefined) {
		// Если передан index_to_edit, редактируем запись по этому индексу
		exist_setting.data = exist_setting.data.map((item, index) => {
			return index === index_to_edit ? new_setting : item
		});
		requestBody = { id: setting_name, data: exist_setting.data };
		_store.val('settings_page_is_loading', false)

	} else {
		// Если index_to_delete и index_to_edit не переданы, добавляем данные
		requestBody = exist_setting
			? { id: setting_name, data: [...exist_setting.data, new_setting] }
			: { id: setting_name, data: [new_setting] }; // Если exist_setting отсутствует
	}

	try {
        const response = await fetch(`${$_store.api_path}/settings?token=${localStorage.getItem('token')}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            keepalive: false,
        });

		if (response.ok) {
			const data = await response.json();

			_store.val('load_settings', false)

			// Делаем запрос для мгновенного обновления settings
			fetch(`${$_store.api_path}/settings?reset_cash=1`)
				.then(response => {
					if (!response.ok) { throw new Error('Network response was not ok') }
					return response.json(); 
				}).then(res => {
					_store.val('load_settings', true)
					_store.val('site_settings',res)
					requestAnimationFrame(() => window.scrollTo(0, scrollPosition)); // Восстановление позиции прокрутки
				}).catch(error => {console.error(error)});

			fetch(`${$_store.api_path}/options`, { 
				method:'POST',  
				headers: { 'Content-Type': 'application/json' }, 
				body: JSON.stringify({type:'version', value: Math.floor(Date.now() / 1000)}),
				keepalive: false 
			}).then(response => {
				// console.log('add version')
			})
		} else {
			toast.warning("Ошибка!", {
				description: `Попробуйте ещё раз.`,
				action: { label: "Закрыть",	 onClick: () => console.info("") },
				position: 'top-right',
			})
		}
		
    } finally {
        _store.val('settings_page_is_loading', false)
    }

	for (const key in add_setting) {
		add_setting[key] = null;
	}
}


// создает и обновляет поле size для определения размера блюда 
const make_sizes = (data) => {
	let group_sizes = set_items.dishes_sizes.find(ds => ds.group == data.group)?.sizes;
	
	// Если group_sizes не определено, завершаем выполнение функции
    if (!group_sizes) return data;

	const processedItems = (items, shouldAssignSizes) => {
		let sortedItems = items.map(item => ({
					...item,
					size: item.available_site === 1 ? null : undefined // Устанавливаем size в null для недоступных на сайте
				})).sort((a, b) => a.price - b.price) 					// Сортируем по цене
				.sort((a, b) => (a.size === null) - (b.size === null))	// Сортируем так, чтобы товары с size null были в конце
				.map((item, index) => ({
					...item,
					size: (shouldAssignSizes && item.size !== null) ? (group_sizes[index] || null) : item.size // Присваиваем size только тем, у кого он ещё не null
				}));
		return sortedItems;
	} 

    if (data.group === 'Пицца') data.items = processedItems(data.items, true);

	if (['Роллы', 'Наборы', 'Закуски'].includes(data.group)) {
		const shouldAssignSizes = data.items.filter(item => item.available_site !== 1).length === 2;
        data.items = processedItems(data.items, shouldAssignSizes);
    }

    return data;
};

// Перезаписывает объект в products  
const editProduct = (id, data = undefined, prod = undefined) => {
	let requestBody = { id };
	let method = 'POST' // по умолчанию, для редактирования data на siteadmin

	_store.val('settings_page_is_loading', true)
	
	// Если data передан, добавляем его в тело запроса
	if (data !== undefined) {
		requestBody.data = make_sizes(data);
	}

	// Если prod передан, добавляем его в тело запроса
	if (prod !== undefined) {
		requestBody.prod = prod;
		method = 'PUT' // для редактирования прода
	}

	fetch(`${$_store.api_path}/products?city=${city}&token=${localStorage.getItem('token')}`, { 
		method,  
		headers: { 'Content-Type': 'application/json' }, 
		body: JSON.stringify(requestBody), 
		keepalive: false 
	}).then(response => _store.val('settings_page_is_loading', false))
	.catch(error => { console.log(error) });
}

</script>

<section class="h-full w-full flex flex-col justify-start mt-8">

	{#if $_store.settings_page_is_loading || !$_store.load_settings}
		<div class="w-full h-full bg-white z-10 my-auto flex flex-col justify-center items-center absolute top-0 left-0">
			<Loader/>
		</div>
	{:else}

	<div class="flex items-center gap-2 pb-5 border-b px-4 text-sm text-center">
		<a href="#img_sliders" class="hover:underline">Картинки для слайдера</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#suggested_products" class="hover:underline">Дополнительные товары</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#filters" class="hover:underline">Фильтры</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#marks" class="hover:underline">Метки</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#modifiers" class="hover:underline">Модификаторы</a>
			<!-- <Separator orientation="vertical" class="h-5" />
		<a href="#present_product" class="hover:underline">Подарочный товар</a> -->
			<Separator orientation="vertical" class="h-5" />
		<a href="#dishes_sizes" class="hover:underline">Размеры блюд</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#roll_categories" class="hover:underline">Категории роллов</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#suggested_products_roll" class="hover:underline">Доп. товары к роллам</a>
			<!-- <Separator orientation="vertical" class="h-5" />
		<a href="#birthday_products" class="hover:underline">Подарочные товары в др</a> -->
			<Separator orientation="vertical" class="h-5" />
		<a href="#delivery" class="hover:underline">Информация о доставке</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#bonus" class="hover:underline">Акции и новости</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#attention_bonus" class="hover:underline">Блок "Внимание" для акций</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#delivery_price" class="hover:underline">Стоимость доставки</a>
			<Separator orientation="vertical" class="h-5" />
		<a href="#present_products" class="hover:underline">Подарки на акции</a>
	</div>

	
	<div class="mx-4 mt-5">
		<p class="font-semibold text-xl">Дополнительные настройки</p>

		<!-- Картинки для слайдера -->
		<Sliders {city_name} {city} {edit_site_settings} />

		<!-- Дополнительные товары -->
		<Separator />
		<SuggestedProducts {city_name} {city} {edit_site_settings} />

		<!-- Дополнительные товары IIKO -->
		<Separator />
		<SuggestedProductsIiko {city_name} {city} {edit_site_settings} />

		<!-- Фильтры -->
		<Separator />
		<Filters {city_name} {city} {edit_site_settings} />

		<!-- Метки, модификаторы-->
		<Separator />
		<div class="flex gap-40 mt-5 mb-8">
			<Marks {edit_site_settings} {editProduct} />
			<Modifiers {edit_site_settings} {editProduct}  />
			<!-- <PresentProduct {city_name} {city} {edit_site_settings} /> -->
		</div>

		<!-- Размеры блюд -->
		<Separator />
		<DishesSizes {edit_site_settings} />

		<!-- Категории роллов -->
		<Separator />
		<RollCategories {edit_site_settings} />

		<!-- Товары к роллам -->
		<Separator />
		<SuggestedProductsRoll {city_name} {city} {edit_site_settings} />

		<!-- Подарочные товары в др -->
		<!-- <Separator />
		<BirthdayProducts {city_name} {city} {edit_site_settings} /> -->

		<!-- Информация о доставке -->
		<Separator />
		<Delivery {city_name} {city} {edit_site_settings} />

		<!-- Акции и новости -->
		<Separator />
		<Bonus {city_name} {city} {edit_site_settings} />

		<!-- Блок Внимание для акций -->
		<Separator />
		<AttentionBonus {city_name} {city} {edit_site_settings} />
	
		<!-- Стоимость доставки -->
		<Separator />
		<DeliveryPrice {city_name} {city} {edit_site_settings} />

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