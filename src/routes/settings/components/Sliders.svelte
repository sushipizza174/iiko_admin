<script lang="ts">
    // @ts-nocheck
    import {_config, _products_iiko, _site_settings} from "$lib/store.svelte.js"
    import { helpers } from "$lib/helpers.js"
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import { XCircle, PlusCircle, Pencil, ChevronsUpDown, Check } from "@lucide/svelte";    
    import Loader from "$lib/components/ui/Loader.svelte";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog";

    let {
        city_name = '',
        city = '',
        edit_site_settings
    } = $props();

    let edit_setting = $state({})

    let not_saved_img = []
    let img_to_delete = null

    let add_setting = $state({
        slider_img: null,
        slider_city: null,
        slider_img_b64: null,
    })

    let img_sliders = $derived(
        Array.isArray(_site_settings?.list)
            ? _site_settings.list.find(s => s.id == 'img_sliders_iiko')?.data ?? []
            : []
    );

    // добавляет картинки на сервер для слайдера с b64 (желательно оптимизировать)
    const upload_file_slider = async (event) => {
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
    const upload_file_edit = async () => {
        const file = event.target.files[0]; 
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        edit_setting.img = 'load';

        try {
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
									<img src={helpers.imgproxy_path(setting.img, '268', '320')} alt="Слайдер {setting.name}" class="w-20 rounded-md" />
									<p class="text-xs text-wrap w-20 break-all">{setting.img}</p>
								</div>

								<div class="flex flex-col gap-2">
								
								<!-- Редактировать -->
								<Dialog.Root onOpenChange={(open) => {
									if (!open) {
										not_saved_img?.forEach(img => { helpers.delete_img(img) });
										not_saved_img = [];
									}}}>
									<Dialog.Trigger onclick={() => {edit_setting = { ...setting }; img_to_delete = edit_setting.img}}><Pencil class="h-5 w-5 !outline-none" /></Dialog.Trigger>
									<Dialog.Content>
										  <Dialog.Header><Dialog.Title>Редактировать</Dialog.Title></Dialog.Header>
										  <div class="grid">
											<div class="flex items-center justify-between my-2 mt-4">
												{#if edit_setting.img && edit_setting.img !== 'load'}
													<p class="break-all">{edit_setting.img}</p>
												{:else if edit_setting.img == 'load'}
													<div class="scale-[0.5]"><Loader /></div>
												{/if}
							
												<label class="cursor-pointer flex items-center" onchange={(event) => upload_file_edit()}>
													<input type="file" class="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
													<Button variant="outline" class="pointer-events-none">Изменить файл</Button>
												</label>
											</div>
											<Dialog.Close class="w-full">
												<Button 
													class="w-full"
													disabled={!edit_setting.img}
													onclick={() =>  {
														let index = img_sliders.findIndex(item => item.id === edit_setting.id)
														not_saved_img.filter(img => img !== edit_setting.img)?.forEach(img => { helpers.delete_img(img) });
                    									not_saved_img = [];
														if (img_to_delete !== edit_setting.img) {
															helpers.delete_img(img_to_delete)
														}
														img_to_delete = null;
														edit_site_settings('img_sliders_iiko', edit_setting, null, index)
													}}>
													Сохранить изменения
												</Button>
											</Dialog.Close>
										</div>
									</Dialog.Content>
								</Dialog.Root>


								<!-- Удалить слайд -->
								<Dialog.Root>
									<Dialog.Trigger onclick={() => edit_setting = { ...setting }} class="!outline-none"><XCircle class="h-5 w-5 text-red-600" /></Dialog.Trigger>
									<Dialog.Content>
										  <Dialog.Header>
											<Dialog.Title>Вы уверены, что хотите удалить слайд?</Dialog.Title>
											<Dialog.Description>Данное действие невозможно отменить.</Dialog.Description>
										</Dialog.Header>
										<Dialog.Close class="flex justify-between">
											<Button variant="secondary">Отменить</Button>
											<Button 
												onclick={() => {
													let index = img_sliders.findIndex(item => item.id === edit_setting.id)
													helpers.delete_img(edit_setting.img); 
													edit_site_settings('img_sliders_iiko', null, index)
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
				not_saved_img?.forEach(img => { helpers.delete_img(img) });
				not_saved_img = [];
				add_setting.slider_img = null;
				add_setting.slider_img_b64 = null;
			}}}>
			<Popover.Trigger asChild class="!outline-none">
				<Button variant="outline" class="mt-3"><PlusCircle class="text-gray-400 h-4 w-4 mr-2" /> Добавить</Button>
			</Popover.Trigger>
			<Popover.Content class="w-max" align="start">
				<p class="font-bold mb-1">Добавить</p>
				<div class="flex items-center flex-wrap gap-2">
					{#if add_setting.slider_img && add_setting.slider_img !== 'load'}
						<p class="ml-3">{add_setting.slider_img}</p>
					{:else if add_setting.slider_img == 'load'}
						<div class="scale-[0.5]"><Loader /></div>
					{/if}

					<label class="cursor-pointer" onchange={upload_file_slider}>
						<input type="file" class="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
						<Button variant="outline" class="pointer-events-none">
							{#if !add_setting.slider_img}
								<PlusCircle class="text-gray-400 h-4 w-4 mr-2" /> 
							{/if}
							{add_setting.slider_img ? 'Изменить ' : 'Добавить '} файл
						</Button>
					</label>
						
					<Button 
						disabled={!add_setting.slider_img}
						onclick={() => {
							const existingIds = img_sliders?.map(item => item.id) || [];
							const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
							not_saved_img.filter(img => img !== add_setting.slider_img)?.forEach(img => { helpers.delete_img(img) });
                    		not_saved_img = [];
							edit_site_settings('img_sliders_iiko', {
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