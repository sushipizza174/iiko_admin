<script lang="ts">
// @ts-nocheck
import { beforeUpdate } from "svelte";
import CaretSort from "svelte-radix/CaretSort.svelte";
import {_store} from "../../../core/_store"
import { utils } from "../../../core/utils"
import { Input } from "$lib/components/ui/input/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import * as Popover from "$lib/components/ui/popover/index.js";
import * as Command from "$lib/components/ui/command/index.js";
import CrossCircled from "svelte-radix/CrossCircled.svelte";
import Pencil2 from "svelte-radix/Pencil2.svelte";
import Loader from "$lib/components/ui/Loader.svelte";
import Check from "svelte-radix/Check.svelte";
import { cn } from "$lib/utils.js";
import { tick } from "svelte";
import { toast } from "svelte-sonner";
import * as Dialog from "$lib/components/ui/dialog";
import PlusCircled from "svelte-radix/PlusCircled.svelte";

export let city_name = ''
export let city = ''
export let edit_site_settings

let products = []
let img_sliders = []
let edit_setting

let not_saved_img = []
let img_to_delete = null

let add_setting = {
    slider_img: null,
	slider_city: null,
	slider_img_b64: null,
}

beforeUpdate(()=>{
	products = $_store.products || [];
	Init_SetIems()
})

const Init_SetIems = () => {
	if ($_store.load_settings) {
        img_sliders = $_store.site_settings.find(s => s.id == 'img_sliders')?.data
        // console.log(img_sliders)
	}
}

// добавляет картинки на сервер для слайдера с b64 (желательно оптимизировать)
async function uploadFileSlider(event) {
    const file = event.target.files[0];
    if (!file) { return; }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 32;
        const height = (img.height / img.width) * width;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);			// Рисуем изображение на canvas с новыми размерами
        const base64 = canvas.toDataURL('image/jpeg', 0.8); // Преобразуем canvas в Base64, 0.8 - качество сжатия
        add_setting.slider_img_b64 = base64;       			// Сохраняем Base64 в slider_img_b64 
    };

	// Создаем FormData для отправки на сервер
	const formData = new FormData();
        formData.append("file", file);

        add_setting.slider_img = 'load';

        try {
            // const response = await fetch(`${$_store.api_path}/upload_img?token=${localStorage.getItem('token')}`, {
			const response = await fetch(`https://fudoadmin.ru/api/image?token=${localStorage.getItem('token')}&key=UHCowkgAEk63vXn62LHmYov`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                add_setting.slider_img = result.filename;
				not_saved_img.push(result.filename);
            } else {
                console.error("Failed to upload file");
            }
        } catch (error) {
            console.error("Error:", error);
        }

}

// Функция для добавления картинки для редактирования
async function uploadFileEdit() {
    const file = event.target.files[0]; 
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    edit_setting.img = 'load';

    try {
        // const response = await fetch(`${$_store.api_path}/upload_img?token=${localStorage.getItem('token')}`, {
			const response = await fetch(`https://fudoadmin.ru/api/image?token=${localStorage.getItem('token')}&key=UHCowkgAEk63vXn62LHmYov`, {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (result.success) {
            edit_setting.img = result.filename;
			not_saved_img.push(result.filename);
        } else {
            console.error("Failed to upload file");
        }
    } catch (error) {
        console.error("Error:", error);
    } 
}

</script>




<!-- Картинки для слайдера -->
	<!-- <Separator /> -->
	<div class="w-full my-8">
		<p class="font-bold mb-2 scroll-mt-[70px]" id="img_sliders">Картинки для слайдера {city_name}</p>

		{#if img_sliders}
			{@const sliders_city = img_sliders.filter(slide => slide.city == city)}
				{#if sliders_city.length > 0}
					<div class="flex gap-5">
						{#each sliders_city as setting}
							{#key setting.img} <!-- Ускоряет ререндеринг -->
							<div class="flex items-start gap-1">
								<div class="flex flex-col justify-center max-w-20">
									<img src={$_store.imgproxy_path(setting.img, '268', '320')} alt="Слайдер {setting.name}" class="w-20 rounded-md" />
									<p class="text-xs text-wrap w-20 break-all">{setting.img}</p>
								</div>

								<div class="flex flex-col gap-2">
								
								<!-- Редактировать -->
								<Dialog.Root onOpenChange={(open) => {
									if (!open) {
										not_saved_img?.forEach(img => { utils.deleteImg(img) });
										not_saved_img = [];
									}}}>
									<Dialog.Trigger on:click={() => {edit_setting = { ...setting }; img_to_delete = edit_setting.img}}><Pencil2 class="h-5 w-5 !outline-none" /></Dialog.Trigger>
									<Dialog.Content>
										  <Dialog.Header><Dialog.Title>Редактировать</Dialog.Title></Dialog.Header>
										  <div class="grid">
											<div class="flex items-center justify-between my-2 mt-4">
												{#if edit_setting.img && edit_setting.img !== 'load'}
													<p class="break-all">{edit_setting.img}</p>
												{:else if edit_setting.img == 'load'}
													<div class="scale-[0.5]"><Loader /></div>
												{/if}
							
												<label class="cursor-pointer flex items-center" on:change={(event) => uploadFileEdit()}>
													<input type="file" class="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
													<Button variant="outline" class="pointer-events-none">Изменить файл</Button>
												</label>
											</div>
											<Dialog.Close class="w-full">
												<Button 
													class="w-full"
													disabled={!edit_setting.img}
													on:click={() =>  {
														let index = img_sliders.findIndex(item => item.id === edit_setting.id)
														not_saved_img.filter(img => img !== edit_setting.img)?.forEach(img => { utils.deleteImg(img) });
                    									not_saved_img = [];
														if (img_to_delete !== edit_setting.img) {
															utils.deleteImg(img_to_delete)
														}
														img_to_delete = null;
														edit_site_settings('img_sliders', edit_setting, null, index)
													}}>
													Сохранить изменения
												</Button>
											</Dialog.Close>
										</div>
									</Dialog.Content>
								</Dialog.Root>


								<!-- Удалить слайд -->
								<Dialog.Root>
									<Dialog.Trigger on:click={() => edit_setting = { ...setting }} class="!outline-none"><CrossCircled class="h-5 w-5 text-red-600" /></Dialog.Trigger>
									<Dialog.Content>
										  <Dialog.Header>
											<Dialog.Title>Вы уверены, что хотите удалить слайд?</Dialog.Title>
											<Dialog.Description>Данное действие невозможно отменить.</Dialog.Description>
										</Dialog.Header>
										<Dialog.Close class="flex justify-between">
											<Button variant="secondary">Отменить</Button>
											<Button 
												on:click={() => {
													let index = img_sliders.findIndex(item => item.id === edit_setting.id)
													utils.deleteImg(edit_setting.img); 
													edit_site_settings('img_sliders', null, index)
											}}>Удалить</Button>
										</Dialog.Close>
									</Dialog.Content>
								</Dialog.Root>
								
								</div>
							</div>
						{/key}
						{/each}
					</div>
				{/if}
		{/if}
		
		<!-- Добавить слайдер -->
		<Popover.Root onOpenChange={(open) => {
			if (!open) {
				not_saved_img?.forEach(img => { utils.deleteImg(img) });
				not_saved_img = [];
				add_setting.slider_img = null;
				add_setting.slider_img_b64 = null;
			}}}>
			<Popover.Trigger asChild let:builder class="!outline-none">
				<Button builders={[builder]} variant="outline" class="mt-3"><PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> Добавить</Button>
			</Popover.Trigger>
			<Popover.Content class="w-max" align="start">
				<p class="font-bold mb-1">Добавить</p>
				<div class="flex items-center flex-wrap gap-2">
					{#if add_setting.slider_img && add_setting.slider_img !== 'load'}
						<p class="ml-3">{add_setting.slider_img}</p>
					{:else if add_setting.slider_img == 'load'}
						<div class="scale-[0.5]"><Loader /></div>
					{/if}

					<label class="cursor-pointer" on:change={uploadFileSlider}>
						<input type="file" class="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
						<Button variant="outline" class="pointer-events-none">
							{#if !add_setting.slider_img}
								<PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> 
							{/if}
							{add_setting.slider_img ? 'Изменить ' : 'Добавить '} файл
						</Button>
					</label>
						
					<Button 
						disabled={!add_setting.slider_img}
						on:click={() => {
							const existingIds = img_sliders?.map(item => item.id) || [];
							const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
							not_saved_img.filter(img => img !== add_setting.slider_img)?.forEach(img => { utils.deleteImg(img) });
                    		not_saved_img = [];
							edit_site_settings('img_sliders', {
								id: maxId + 1, 
								city, 
								img: add_setting.slider_img, 
								b64: add_setting.slider_img_b64
							})
						}}>
						Сохранить
					</Button>
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>