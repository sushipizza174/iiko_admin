<script>
    import {onMount} from 'svelte'
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import Loader from "$lib/components/ui/Loader.svelte";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Pagination from "$lib/components/ui/pagination/index.js";
    import { toast } from "svelte-sonner";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { Badge } from "$lib/components/ui/badge";
    import {X, Plus, ChevronsUpDown, ChevronLeftIcon, ChevronRightIcon, Check, AlertTriangle} from "@lucide/svelte";
    import { _products_iiko, _city, _site_settings, _config } from '$lib/store.svelte';
    import { get, post, put } from "$lib/server";

    let products = $state([])
    // let products_orig = []
    let edit_product = $state();
    let group_names = $state();
    let is_loading  = $state(false);
    let open_group = $state(false);
    let open_compose_new = $state(false);

    let rows_page = 10;
    let row_count = $derived(products.length);
    let page_is_loading = false;

    let filters = $state({
        name: null, 
        group: null,
    })

    let selected_group = $derived((group_names?.find((g) => g.toLowerCase().includes(filters.group?.toLowerCase())) ?? "Группа")
        .slice(0, 24) + (group_names?.find((g) => g.toLowerCase().includes(filters.group?.toLowerCase()))?.length > 24 ? '...' : ''))

    // Создаем logs через обычный $derived
    const logs = $derived({
        sets_without_count: _products_iiko.list.filter(p => 
            p.group == 'Наборы' && (!p.count || p.count == 0)
        ),
        rolls_without_category: _products_iiko.list.filter(p => 
            p.group == 'Роллы' && (!p.roll_category || p.roll_category == '-')
        ),
        products_with_incorrect_marks: _products_iiko.list.filter(p => 
            p.mark.length > 0 && !p.mark.some(mark => ['новинка', 'остро'].includes(mark))
        ),
        new: _products_iiko.list?.filter(product => product.mark == 'новинка'),
        hot: _products_iiko.list?.filter(product => product.mark == 'остро'),
        products_without_weight_or_kbju: _products_iiko.list?.filter(product => 
            product.group !== 'Технически позиции' && product.items?.some(item => 
                !item.weight || !item.protein || !item.calory || !item.carbohydrate || !item.fat
            )
        ),
        pizzas_without_dough_modifier: _products_iiko.list?.filter(product => 
            product.group == 'Пицца' && product.modifiers?.every(mod => mod.name !== 'тесто')
        ),
        pizzas_sauce_modifier: _products_iiko.list?.filter(product => 
            product.group == 'Пицца' && product.modifiers?.some(mod => mod.name == 'соус')
        ),
        modifiers_without_weight_or_kbju: _products_iiko.list?.flatMap(product => 
            product.modifiers
                ?.filter(mod => 
                    mod.items?.some(item => !item.weight || !item.protein || !item.calory || !item.carbohydrate || !item.fat)
                )
                .map(mod => ({
                    product: product.name,
                    name: mod.name,
                })) || []
        ),
        delivery_without_zone: _products_iiko.list.filter(p => 
            p.group == 'Технически позиции' && p.name.toLowerCase().includes('доставка') && !p.zone
        ),
        sets_without_compos: _products_iiko.list.filter(p => 
            p.group == 'Наборы' && (!p.compos || p.compos.length === 0)
        )
    });

    const is_update_disabled = $derived(
        logs.sets_without_count?.length > 0 || 
        logs.rolls_without_category?.length > 0 || 
        logs.delivery_without_zone?.length > 0 || 
        logs.sets_without_compos?.length > 0
    );

    let img_to_delete = []
    let not_saved_img = []

    const imgproxy_path = (file, width, height) => `https://fudomedia.ru/insecure/rs:fill:${width}:${height}/g:ce/format:webp/${btoa(`${_config.img_api}${file}`)}`;

    const update_filtered = () => {
        products = filter_products()
    }

    const filter_products = () => {
        let result = [..._products_iiko.list]; 
        if (filters.name) {
            result = result.filter(product => product.name.toLowerCase().includes(filters.name?.toLowerCase()))
        }

        if (filters.group  && filters.group !== 'Все') {
            result = result.filter(product => product.group?.toLowerCase().includes(filters.group.toLowerCase()))
        }
        return result
    }

    onMount( async () => {
        try {
            const data = await get(`products?city=${_city}&type=stage`);
            _products_iiko.list = Array.isArray(data) ? data : [];
            update_filtered()
            _products_iiko.loading = false
            group_names = ['Все', ...new Set(data.map(p => p.group).filter(Boolean))];
        } catch (e) {
            console.error("Ошибка загрузки:", e);
            _products_iiko.list = [];
        }
    })

    const update_from_iiko = async () => {
        is_loading = true
        try {
            products = await get(`menu?city=${_city}`);
            _products_iiko.list = products;
            _products_iiko.loading = false
            group_names = ['Все', ...new Set(products.map(p => p.group).filter(Boolean))];
            toast.success("Успешно!", {
                description: `База обновлена`,
                action: { label: "Закрыть",	onClick: () => console.info("") },
                position: 'top-right',
            })
            is_loading = false
        } catch (e) {
            console.error("Ошибка загрузки:", e);
        }
    }

    const update_prod = async () => {
        const scroll_position = window.scrollY; // Сохранение текущей прокрутки
        is_loading = true

        try {
            let res = await put(`products?city=${_city}`);
            toast.success("Успешно!", {
                description: `Данные на сайте обновлены`,
                action: { label: "Закрыть",	onClick: () => console.info("") },
                position: 'top-right',
            })
            is_loading = false; 
            requestAnimationFrame(() => window.scrollTo(0, scroll_position)); // Восстановление позиции прокрутки
        } catch (e) {
            console.error("Ошибка загрузки:", e);
        }
        
    }

    // добавляет картинку на сервер
    async function upload_file() {
        const file = event.target.files[0]; 
        if (!file) { return }

        const formData = new FormData();
        formData.append("file", file);

        is_loading = true;
        edit_product.img = edit_product.img ? [...edit_product.img, 'load'] : ['load'];	 // Добавляем временное значение "load"

        try {
            // const response = await fetch(`${$_store.api_path}/upload_img?token=${localStorage.getItem('token')}`, {
            const response = await fetch(`https://fudoadmin.ru/api/image?token=${localStorage.getItem('token')}&key=UHCowkgAEk63vXn62LHmYov`, {
                method: "POST",
                body: formData
            });
            if (result.success) {	
                edit_product.img = edit_product.img.map(img => img === 'load' ? result.filename : img); // Заменяем 'load' на реальное имя файла
                not_saved_img.push(result.filename);
                is_loading = false; // Выключаем индикатор загрузки
            } else {
                console.error("Failed to upload file");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const edit_img = async (product) => {
        const scrollPosition = window.scrollY; // Сохранение текущей прокрутки
        is_loading = true

        let request_body = {
            iiko_id: product.iiko_id, 
            img: product.img
        }

        if (product.group === "Наборы") {
            request_body.compos = product.compos
        }

        try {
            await post(`/products?city=${_city}`, request_body) 
            products = _products_iiko.list.map(p => 
                p.iiko_id === product.iiko_id 
                    ? {
                        ...p, 
                        img: product.img,
                        ...(product.group === "Наборы" && product.compos && { compos: product.compos })     // Если это набор и есть состав - добавляем
                    }   
                    : p
            );
            _products_iiko.list = products
            is_loading = false; 
            requestAnimationFrame(() => window.scrollTo(0, scrollPosition)); // Восстановление позиции прокрутки
        } catch(e){
            console.error(e)
        }
    }
    
</script>


{#if is_loading}
    <div class="w-full h-full bg-white z-10 my-auto flex flex-col justify-center items-center absolute top-0 left-0">
        <Loader/>
    </div>
{/if}


<div class="mt-8 px-2">
    <div class="flex items-center gap-2 px-4">
        <Popover.Root bind:open={open_group}>
            <Popover.Trigger asChild class="!outline-none">
                <Button
                    variant="outline"
                    role="combobox"
                    class="w-48 font-normal justify-between"
                >
                    {selected_group}
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </Popover.Trigger>
            <Popover.Content class="p-0">
                <ScrollArea class="h-72 rounded-md">
                    <Command.Root>
                        <Command.Input placeholder="Поиск" class="h-9" />
                        <Command.Empty>Не найдено</Command.Empty>
                        <Command.Group>
                            {#each group_names as group}
                                <Command.Item
                                    value={group}
                                    onSelect={() => {
                                        filters.group = group;
                                        open_group = false;
                                        update_filtered()
                                    }}
                                >
                                    <Check class={cn( "mr-2 h-4 w-4",  filters.group !== group && "text-transparent")}  />
                                    {group}
                                </Command.Item>
                            {/each}
                        </Command.Group>
                    </Command.Root>
                </ScrollArea>
                
            </Popover.Content>
        </Popover.Root>

        <Button variant="secondary" onclick={update_from_iiko}>Обовить из IIKO</Button>

        <div class="relative">
            {#if is_update_disabled}
                <Button 
                    variant="outline" class="absolute top-0 left-0 !bg-gray-50 !text-gray-200 cursor-not-allowed"
                    onclick={() => toast.success("Ошибка!", {
                        description: `Пожалуйста, обратите внимание на красные тикеты`,
                        action: { label: "Закрыть",	onClick: () => console.info("") },
                        position: 'top-right',
                    })}
                >
                    Обновить на сайте
                </Button>
            {/if}
            <Button 
                variant="outline" onclick={update_prod} 
                disabled={is_update_disabled}
            >
                Обновить на сайте
            </Button>
        </div>
        
        <a href="https://sushipicca74-co-co.iikoweb.ru/external-menu/index.html#/external-menu" class="underline pl-10" target="_blank">Перейти в IIKO WEB</a>
    </div>

    <div class="flex items-start gap-3 mb-8 mx-4 mt-4">
        <div class="w-max rounded-xl shadow-md py-2 px-4 border">
            <Pagination.Root count={row_count} perPage={rows_page} class="flex flex-col">
                {#snippet children({ pages, currentPage })}
                    <Table.Root class="min-h-[300px] w-[700px] my-2">
                        <Table.Header>
                            <Table.Row class="cursor-default mx-4 my-2 *:p-1">
                                <Table.Head>Изображение</Table.Head>
                                <Table.Head class="relative w-40">
                                    <Input type="text" placeholder="Название" bind:value={filters.name} oninput={update_filtered} />
                                    <button onclick={() => filters.name = ''} class="absolute top-1/2 right-3 transform -translate-y-1/2"><X class="w-3 h-3 text-gray-400" /></button>
                                </Table.Head>
                                <Table.Head>Фильтры</Table.Head>
                                <Table.Head>Удалить</Table.Head>

                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {#if products.length > 0}
                                {#each products.slice((currentPage - 1) * rows_page, currentPage * rows_page) as product (product.iiko_id) }		
                                    <Table.Row class="even:bg-gray-50 dark:even:bg-stone-800">
                                        <Table.Cell>
                                            <Dialog.Root onOpenChange={(open) => {
                                                if (!open) {
                                                    not_saved_img.forEach(img => { utils.deleteImg(img) });
                                                    not_saved_img = [];
                                                }}}>
                                                <Dialog.Trigger onclick={() => { edit_product = {...product}; img_to_delete = []}} class="!outline-none relative">
                                                    {#if product.mark?.length > 0}
                                                        <div class="absolute top-0 left-0 flex gap-1 items-center">
                                                            {#each product.mark as mark}
                                                            {@const img_name = mark == 'остро' ? 'hot' : 'new'}
                                                                <img src="img/{img_name}.svg" alt="{mark} {product.iiko_id}" class="h-3">
                                                            {/each}
                                                        </div>
                                                    {/if}
                                                    {#if product.img?.length > 0}
                                                        <!-- <img src="{imgproxy_path(product.img[0], '160', '106')}" alt={product.name} class="w-36 rounded" onerror={this.src='img/error.png'}> -->
                                                        <img src="{imgproxy_path(product.img[0], '100', '100')}" alt={product.name} class="w-36 h-16 scale-50 rounded" onerror={this.src='img/error.png'}>
                                                    {:else}
                                                        <img src='img/error.png' alt={`Ошибка ${product.name}`} class="w-36 rounded">
                                                    {/if}
                                                </Dialog.Trigger>
                                                <Dialog.Content class="max-w-[600px]">
                                                    <Dialog.Header> 
                                                        <Dialog.Title>
                                                            {#if edit_product?.group !== "Наборы"}
                                                                Изменить изображение для {edit_product?.name}
                                                            {:else}
                                                                Редактировать набор {edit_product?.name}
                                                            {/if}
                                                        </Dialog.Title> 
                                                    </Dialog.Header>

                                                    <div class="flex w-full items-center">
                                                        {#if edit_product?.img && edit_product?.img.length > 0}
                                                        <div class="flex flex-wrap mr-5 grow gap-5">
                                                            {#each edit_product.img as img, index}
                                                                <div>
                                                                    <div class="flex">
                                                                        {#if img !== 'load'}
                                                                            <img src="{imgproxy_path(img, '80', '53')}" alt="{img}" class="mx-auto rounded w-[80px]" onerror={this.src='./img/coming_soon1.png'}>
                                                                        {:else}
                                                                            <div class="border w-[100px] h-[53px] rounded flex justify-center items-center">
                                                                                <div class="scale-[0.5]">
                                                                                    <Loader />
                                                                                </div>
                                                                            </div>
                                                                        {/if}
                                                                        <div role="button" tabindex="0" aria-label="Удалить элемент" 
                                                                            onclick={() => {
                                                                                img_to_delete.push(img);
                                                                                edit_product.img = edit_product.img.filter((_, i) => i !== index)
                                                                            }}
                                                                            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { edit_product.img = edit_product.img.filter((_, index) => index !== index) } }}>
                                                                            <X class="text-red-600 h-5 w-5 ml-1" />
                                                                        </div>
                                                                    </div>
                                                                    <p class="text-[12px] w-20 text-wrap break-all">{(img !== 'load') ? img : 'Дождитесь загрузки файла!'}</p>
                                                                </div>
                                                            {/each}
                                                        </div>
                                                        {/if}
                                                        <label class="cursor-pointer" onchange={upload_file}>
                                                            <input type="file" class="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
                                                            <Button variant="outline" class="pointer-events-none">
                                                                <Plus circle={true} class="text-gray-400 h-4 w-4 mr-2" /> 
                                                                Добавить файл
                                                            </Button>
                                                        </label>
                                                    </div>

                                                    {#if edit_product?.group === "Наборы"}
                                                        <div class="flex w-full items-start">
                                                            <p class="font-semibold text-sm mr-2 mt-0.5">Состав&nbspнабора:</p>
                                                            <div class="flex items-start w-full">
                                                                <Popover.Root bind:open={open_compose_new}>
                                                                    <Popover.Trigger asChild let:builder class="w-60 !outline-none">
                                                                        <Button
                                                                            builders={[builder]}
                                                                            variant="outline"
                                                                            role="combobox"
                                                                            class="border-none p-0 m-0 hover:bg-transparent shadow-none rounded-full h-min"
                                                                        >
                                                                            <Plus circle={true} class="text-gray-400 h-5 w-5 mt-[3px] mr-2" />
                                                                        </Button>
                                                                    </Popover.Trigger>
                                                                    <Popover.Content class="p-0">
                                                                        <ScrollArea class="h-72">
                                                                            <Command.Root>
                                                                                <Command.Input placeholder="Поиск" class="h-9" />
                                                                                <Command.Empty>Не найдено</Command.Empty>
                                                                                <Command.Group>
                                                                                    {#each _products_iiko.list.filter(p => p.group == 'Роллы') as p}
                                                                                        <Command.Item
                                                                                            value={p.name}
                                                                                            onSelect={() => {
                                                                                                if (edit_product.compos) {
                                                                                                    if (!edit_product.compos.some(item => item === p.iiko_id)) {
                                                                                                        edit_product.compos = [...edit_product.compos, p.iiko_id];
                                                                                                    }
                                                                                                } else edit_product.compos = [p.iiko_id];
                                                                                                open_compose_new = false
                                                                                            }}
                                                                                        >
                                                                                            <!-- <Check class={cn( "mr-2 h-4 w-4",  type !== p.data.type && "text-transparent")}  /> -->
                                                                                            {p.name}
                                                                                        </Command.Item>
                                                                                    {/each}
                                                                                </Command.Group>
                                                                            </Command.Root>
                                                                        </ScrollArea>
                                                                            
                                                                    </Popover.Content>
                                                                </Popover.Root>
                                                                <div class="flex flex-wrap">
                                                                    {#if edit_product.compos?.length > 0}
                                                                        {#each edit_product.compos as item, i}
                                                                        {@const roll = _products_iiko.list.find(p => p.iiko_id === item) ?? {name: 'Удалённый товар'}}
                                                                            <div role="button"
                                                                                tabindex="0"
                                                                                aria-label="Удалить элемент" 
                                                                                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { edit_product.compos = edit_product.compos.filter((_, index) => index !== i) } }} 
                                                                                onclick={() => edit_product.compos = edit_product.compos.filter((_, index) => index !== i)}
                                                                            >
                                                                                <Badge variant="outline" class="cursor-pointer mr-2 mb-1">
                                                                                    {roll.name} 
                                                                                    <X class="h-2.5 w-2.5 ml-1 2 mt-0.5" />
                                                                                </Badge>
                                                                            </div>
                                                                        {/each}
                                                                    {/if}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    {/if}

                                                    <Dialog.Close class="w-min">
                                                        <Button type="submit" onclick={() =>{ 
                                                            img_to_delete.forEach(img => { utils.deleteImg(img) });
                                                            img_to_delete = []
                                                            not_saved_img = []
                                                            edit_img(edit_product)
                                                        }}>Сохранить</Button>
                                                    </Dialog.Close>
                                                </Dialog.Content>
                                            </Dialog.Root>
                                        </Table.Cell>
                                        <Table.Cell>{product.name}</Table.Cell>
                                        <!-- <Table.Cell>{product.filters ? 'yes' : '-'}</Table.Cell> -->
                                        <Table.Cell class="w-[300px]">
                                            {#each Object.entries(product.filters) as [name, values]}
                                                {#if values?.length > 0}<p><strong>{name}: </strong>{values?.join(', ')}</p>{/if}
                                            {/each}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Dialog.Root>
                                                <Dialog.Trigger class="!outline-none"><Button variant="destructive">Удалить</Button></Dialog.Trigger>
                                                <Dialog.Content class="max-w-[600px]">
                                                    <Dialog.Header> 
                                                        <Dialog.Title>Вы действительно хотите удалить товар {product?.name}?</Dialog.Title> 
                                                        <Dialog.Description>Товар полностью удалится с сайта после обновления базы данных.</Dialog.Description> 
                                                    </Dialog.Header>

                                                    <Dialog.Close class="w-full mt-6">
                                                        <Button class="w-full" onclick={() => delete_product(product.iiko_id)}>Удалить</Button>
                                                    </Dialog.Close>
                                                </Dialog.Content>
                                            </Dialog.Root>
                                        </Table.Cell>
                                    </Table.Row>
                                {/each}
                            {/if}
                        </Table.Body>
                    </Table.Root>

                    <div class="flex items-center justify-between px-4 py-4 border-t bg-gray-50/50 dark:bg-gray-900/50">
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                            Показано {Math.min((currentPage - 1) * rows_page + 1, row_count)} - {Math.min(currentPage * rows_page, row_count)} из {row_count}
                        </div>
                        <Pagination.Content class="flex items-center gap-1">
                            <Pagination.Item>
                                <Pagination.PrevButton>
                                    <ChevronLeftIcon class="size-4" />
                                    <span class="hidden sm:block">Пред.</span>
                                </Pagination.PrevButton>
                            </Pagination.Item>
                            {#each pages as page (page.key)}
                                {#if page.type === "ellipsis"}
                                    <Pagination.Item>
                                        <Pagination.Ellipsis />
                                    </Pagination.Item>
                                {:else}
                                    <Pagination.Item isVisible={currentPage == page.value}>
                                        <Pagination.Link {page} isActive={currentPage == page.value} class="h-9 w-9">
                                            {page.value}
                                        </Pagination.Link>
                                    </Pagination.Item>
                                {/if}
                            {/each}
                            <Pagination.Item>
                                <Pagination.NextButton>
                                        <span class="hidden sm:block">След.</span>
                                        <ChevronRightIcon class="size-4" />
                                    </Pagination.NextButton>
                            </Pagination.Item>
                        </Pagination.Content>
                    </div>
                {/snippet}
            </Pagination.Root>
        </div>

        <div class="flex flex-wrap items-start gap-3">
            {#if logs.sets_without_count.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[270px] bg-red-100">
                    <div class="flex gap-3 items-center">
                        <AlertTriangle class="text-primary w-5" />
                        <p class="font-bold">Наборы без количества:</p>
                    </div>
                    <ul class="ml-12 list-disc">
                        {#each logs.sets_without_count as product}
                            <li>{product.name}</li>
                        {/each}
                    </ul>
                </div>
            {/if}

            {#if logs.rolls_without_category.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[280px] bg-red-100">
                    <div class="flex gap-3 items-center">
                        <AlertTriangle class="text-primary w-5" />
                        <p class="font-bold">Роллы без подкатегории:</p>
                    </div>
                    <ul class="ml-12 list-disc">
                        {#each logs.rolls_without_category as product}
                            <li>{product.name}</li>
                        {/each}
                    </ul>
                </div>
            {/if}

            {#if logs.products_with_incorrect_marks.length > 0}
                <div class="border shadow-lg rounded-xl px-4 py-2 max-w-[280px] bg-red-100">
                    <div class="flex gap-3 items-center">
                        <AlertTriangle class="text-primary w-5" />
                        <p class="font-bold text-left">Плашки не совпадают <br /> с "остро" и "новинка":</p>
                    </div> 
                    <ul class="ml-12 list-disc">
                        {#each logs.products_with_incorrect_marks as product}
                            <li>{product.name}</li>
                        {/each}
                    </ul>
                </div>
            {/if}

            {#if logs.delivery_without_zone.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[280px] bg-red-100">
                    <ScrollArea class="h-60">
                        <div class="flex gap-3 items-center">
                            <p class="font-bold">Доставка без зоны:</p>
                        </div>
                        <ul class="ml-8 list-disc">
                            {#each logs.delivery_without_zone as product}
                                <li>{product.name}</li>
                            {/each}
                        </ul>
                    </ScrollArea>
                </div>
            {/if}

            {#if logs.sets_without_compos.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[280px] bg-red-100">
                    <ScrollArea class="h-60">
                        <div class="flex gap-3 items-center">
                            <p class="font-bold">Наборы без состава:</p>
                        </div>
                        <ul class="ml-8 list-disc">
                            {#each logs.sets_without_compos as product}
                                <li>{product.name}</li>
                            {/each}
                        </ul>
                    </ScrollArea>
                </div>
            {/if}

            {#if logs.products_without_weight_or_kbju.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[280px] bg-orange-100">
                    <ScrollArea class="h-60">
                        <div class="flex gap-3 items-center">
                            <p class="font-bold">Товары без веса или кбжу ({logs.products_without_weight_or_kbju.length}):</p>
                        </div>
                        <ul class="ml-8 list-disc">
                            {#each logs.products_without_weight_or_kbju as product}
                                <li>{product.name}</li>
                            {/each}
                        </ul>
                    </ScrollArea>
                </div>
            {/if}

            {#if logs.modifiers_without_weight_or_kbju.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[280px] bg-orange-100">
                    <ScrollArea class="h-60">
                        <div class="flex gap-3 items-center">
                            <p class="font-bold">Модификаторы без веса или кбжу:</p>
                        </div>
                        <ul class="ml-8 list-disc">
                            {#each logs.modifiers_without_weight_or_kbju as product}
                                <li>{product.name}, {product.product}</li>
                            {/each}
                        </ul>
                    </ScrollArea>
                </div>
            {/if}

            {#if logs.pizzas_without_dough_modifier.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[280px] bg-orange-100">
                    <ScrollArea class="h-60">
                        <div class="flex gap-3 items-center">
                            <p class="font-bold">Пиццы БЕЗ модификатора тесто:</p>
                        </div>
                        <ul class="ml-8 list-disc">
                            {#each logs.pizzas_without_dough_modifier as product}
                                <li>{product.name}</li>
                            {/each}
                        </ul>
                    </ScrollArea>
                </div>
            {/if}

            {#if logs.pizzas_sauce_modifier.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[280px]">
                    <ScrollArea class="h-60">
                        <div class="flex gap-3 items-center">
                            <p class="font-bold">Пиццы с модификатором Соус:</p>
                        </div>
                        <ul class="ml-8 list-disc">
                            {#each logs.pizzas_sauce_modifier as product}
                                <li>{product.name}</li>
                            {/each}
                        </ul>
                    </ScrollArea>
                </div>
            {/if}

            {#if logs.new.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[280px]">
                    <ScrollArea class="h-60">
                        <div class="flex gap-3 items-center">
                            <p class="font-bold">Новинки:</p>
                        </div>
                        <ul class="ml-8 list-disc">
                            {#each logs.new as product}
                                <li>{product.name}</li>
                            {/each}
                        </ul>
                    </ScrollArea>
                </div>
            {/if}

            {#if logs.hot.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[280px]">
                    <ScrollArea class="h-60">
                        <div class="flex gap-3 items-center">
                            <p class="font-bold">Остро:</p>
                        </div>
                        <ul class="ml-8 list-disc">
                            {#each logs.hot as product}
                                <li>{product.name}</li>
                            {/each}
                        </ul>
                    </ScrollArea>
                </div>
            {/if}

            

            <!-- {#if _products_iiko.list.find(p => p.group == 'Закуски' && (p.count || p.count !== 0))}
                <div class="border shadow-lg rounded-xl px-4 py-2 max-w-[280px]">
                    <div class="flex gap-3 items-center">
                        <p class="font-bold">Закуски с количеством:</p>
                    </div>
                    <ul class="ml-12 list-disc">
                        {#each _products_iiko.list.filter(p => p.group == 'Закуски' && (p.count || p.count !== 0)) as product}
                            <li>{product.name}</li>
                        {/each}
                    </ul>
                </div>
            {/if} -->

            
            
        </div>
    </div>
</div>