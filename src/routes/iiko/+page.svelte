<svelte:head>
	<title>Управление товарами</title>
	<meta name="description" content="IIKO" />
</svelte:head>

<script>
    //@ts-nocheck
    import { beforeUpdate, onMount } from "svelte";
    import {_store} from "../../core/_store"
    import { Input } from "$lib/components/ui/input/index.js";
    import Cross2 from "svelte-radix/Cross2.svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { utils } from "../../core/utils"
    import { Button } from "$lib/components/ui/button/index.js";
    import Loader from "$lib/components/ui/Loader.svelte";
    import CrossCircled from "svelte-radix/CrossCircled.svelte";
    import PlusCircled from "svelte-radix/PlusCircled.svelte";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import CaretSort from "svelte-radix/CaretSort.svelte";
    import Check from "svelte-radix/Check.svelte";
    import ExclamationTriangle from "svelte-radix/ExclamationTriangle.svelte";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Pagination from "$lib/components/ui/pagination/index.js";
    import { toast } from "svelte-sonner";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { Badge } from "$lib/components/ui/badge";


    let products = []
    // let products_orig = []
    let edit_product;
    let group_names;
    let is_loading;
    let open = {};

    let rows_per_page = 10;
    let row_count = 1;
    let page_is_loading = false;

    let filters = {
        name: null, 
        group: null,
    }

    onMount(() => {
        fetch(`${$_store.fudo_api}/products?city=${$_store.city}&type=stage`)
            .then(response => {
                if (!response.ok) { throw new Error('Network response was not ok') }
                return response.json(); 
            }).then(res => {
                // console.log(res)
                // products_orig = res
                // products = res
				_store.val('products_iiko',res);
                group_names = ['Все', ...new Set(res.map(p => p.group).filter(Boolean))];
            }).catch(error => {console.error(error)});
    })

    function format_phone_number(phoneStr) {
        const digits = phoneStr?.replace(/\D/g, ''); // Оставляем только цифры
        
        // Проверяем длину номера
        if (digits?.length == 11)  {
            return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
        }

        return ''
    }

    beforeUpdate(() => {
        products = [...$_store.products_iiko];
        
        filters.name && (products = products.filter(product => product.name.toLowerCase().includes(filters.name?.toLowerCase())))
        filters.group && filters.group !== 'Все' && (products = products.filter(product => product.group?.toLowerCase().includes(filters.group.toLowerCase())))

	    row_count = products.length;
        // console.log(products)
    })

    let img_to_delete = []
    let not_saved_img = []

    const imgproxy_path = (file, width, height) => `https://fudomedia.ru/insecure/rs:fill:${width}:${height}/g:sm/format:webp/${btoa(`${$_store.imgApi}${file}`)}`;

    // добавляет картинку на сервер
    async function uploadFile() {
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
            const result = await response.json();
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

    const edit_img = (product) => {
        const scrollPosition = window.scrollY; // Сохранение текущей прокрутки
        is_loading = true

        let request_body = {
            iiko_id: product.iiko_id, 
            img: product.img
        }

        if (product.group === "Наборы") {
            request_body.compos = product.compos
        }

        fetch(`${$_store.fudo_api}/products?city=${$_store.city}`, { 
            method: 'POST',  
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(request_body),
            keepalive: false 
        }).then(response => {
            products = $_store.products_iiko.map(p => 
                p.iiko_id === product.iiko_id 
                    ? {
                        ...p, 
                        img: product.img,
                        ...(product.group === "Наборы" && product.compos && { compos: product.compos })     // Если это набор и есть состав - добавляем
                    }   
                    : p
            );


            _store.val('products_iiko', products)
            is_loading = false; 
            requestAnimationFrame(() => window.scrollTo(0, scrollPosition)); // Восстановление позиции прокрутки
        })
    }

    const delete_product = (iiko_id) => {
        is_loading = true
        fetch(`${$_store.fudo_api}/products?city=${$_store.city}`, { 
                method: 'DELETE',  
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ iiko_id }), 
                keepalive: false 
            }).then(() => {
                products = products.filter(p => p.iiko_id !== iiko_id);
                _store.val('products_iiko', products)

                is_loading = false
                toast.success("Успешно!", {
                    description: `Товар удалён`,
                    action: { label: "Закрыть",	onClick: () => console.info("") },
                    position: 'top-right',
                })
            }).catch(error => {
                console.log(error);
            });
    }

    const update_from_iiko = () => {
        is_loading = true
        fetch(`${$_store.fudo_api}/menu?city=${$_store.city}`)
            .then(response => {
                if (!response.ok) { throw new Error('Network response was not ok') }
                return response.json(); 
            }).then(res => {
                // console.log(res)
                // products_orig = res
                products = res
				_store.val('products_iiko',res);
                group_names = ['Все', ...new Set(res.map(p => p.group).filter(Boolean))];

                toast.success("Успешно!", {
                    description: `База обновлена`,
                    action: { label: "Закрыть",	onClick: () => console.info("") },
                    position: 'top-right',
                })
                is_loading = false
            }).catch(error => {console.error(error)});
    }

    const update_prod = () => {
        const scrollPosition = window.scrollY; // Сохранение текущей прокрутки
        is_loading = true

        fetch(`${$_store.fudo_api}/products?city=${$_store.city}&token=${localStorage.getItem('token')}`, { 
            method: 'PUT',  
            headers: {
                "Content-Type": "application/json",
                ...(localStorage.getItem('token') && {
                    Authorization: "Bearer" + " " + localStorage.getItem('token'),
                }),
            },
            body: JSON.stringify({}), 
            keepalive: false 
        }).then(response => {
            toast.success("Успешно!", {
                description: `Данные на сайте обновлены`,
                action: { label: "Закрыть",	onClick: () => console.info("") },
                position: 'top-right',
            })
            is_loading = false; 
            requestAnimationFrame(() => window.scrollTo(0, scrollPosition)); // Восстановление позиции прокрутки
        })
    }

    const closeAndFocusTrigger = (triggerId) => {
        for (const key in open) {
            open[key] = false;
        }
        tick().then(() => { document.getElementById(triggerId)?.focus() });
    }

    $: selected_group = (group_names?.find((g) => g.toLowerCase().includes(filters.group?.toLowerCase())) ?? "Группа")
        .slice(0, 24) + (group_names?.find((g) => g.toLowerCase().includes(filters.group?.toLowerCase()))?.length > 24 ? '...' : '');

    let logs = {}

    $: logs.sets_without_count = $_store.products_iiko.filter(p => p.group == 'Наборы' && (!p.count || p.count == 0))
    $: logs.rolls_without_category = $_store.products_iiko.filter(p => p.group == 'Роллы' && (!p.roll_category || p.roll_category == '-'))
    $: logs.products_with_incorrect_marks = $_store.products_iiko.filter(p => p.mark.length > 0 && !p.mark.some(mark => ['новинка', 'остро'].includes(mark)))
    $: logs.new = $_store.products_iiko?.filter(product => product.mark == 'новинка')
    $: logs.hot = $_store.products_iiko?.filter(product => product.mark == 'остро')
    $: logs.products_without_weight_or_kbju = $_store.products_iiko?.filter(product => 
        product.group !== 'Технически позиции' && product.items?.some(item => 
            !item.weight || !item.protein || !item.calory || !item.carbohydrate || !item.fat
        )
    )
    $: logs.pizzas_without_dough_modifier = $_store.products_iiko?.filter(product => 
        product.group == 'Пицца' && product.modifiers?.every(mod => mod.name !== 'тесто')
    )

    $: logs.pizzas_sauce_modifier = $_store.products_iiko?.filter(product => 
        product.group == 'Пицца' && product.modifiers?.some(mod => mod.name == 'соус')
    )

    $: logs.modifiers_without_weight_or_kbju = $_store.products_iiko?.flatMap(product => 
        product.modifiers
            ?.filter(mod => 
                mod.items?.some(item => !item.weight || !item.protein || !item.calory || !item.carbohydrate || !item.fat)
            )
            .map(mod => ({
                product: product.name,
                name: mod.name,
                // items: mod.items?.filter(item => !item.weight || !item.protein || !item.calory || !item.carbohydrate || !item.fat)
            })) || []
    )

    $: logs.delivery_without_zone = $_store.products_iiko.filter(p => p.group == 'Технически позиции' && p.name.toLowerCase().includes('доставка') && !p.zone)
    $: logs.sets_without_compos = $_store.products_iiko.filter(p => p.group == 'Наборы' && (!p.compos || p.compos.length === 0))

    $: is_update_disabled = logs.sets_without_count.length > 0 || logs.rolls_without_category.length > 0 || logs.delivery_without_zone.length > 0 
</script>

{#if is_loading}
    <div class="w-full h-full bg-white z-10 my-auto flex flex-col justify-center items-center absolute top-0 left-0">
        <Loader/>
    </div>
{/if}


<div class="mt-8 px-2">
    <div class="flex items-center gap-2 px-4">
        <Popover.Root bind:open={open.group} let:ids>
            <Popover.Trigger asChild let:builder class="!outline-none">
                <Button
                    builders={[builder]}
                    variant="outline"
                    role="combobox"
                    class="w-48 font-normal justify-between"
                >
                    {selected_group}
                    <CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                    onSelect={(currentValue) => {
                                    filters.group = currentValue;
                                    closeAndFocusTrigger(ids.trigger);
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

        <Button variant="secondary" on:click={update_from_iiko}>Обовить из IIKO</Button>

        <div class="relative">
            {#if is_update_disabled}
                <Button 
                    variant="outline" class="absolute top-0 left-0 !bg-gray-50 !text-gray-200 cursor-not-allowed"
                    on:click={() => toast.success("Ошибка!", {
                        description: `Пожалуйста, обратите внимание на красные тикеты`,
                        action: { label: "Закрыть",	onClick: () => console.info("") },
                        position: 'top-right',
                    })}
                >
                    Обновить на сайте
                </Button>
            {/if}
            <Button 
                variant="outline" on:click={update_prod} 
                disabled={is_update_disabled}
            >
                Обновить на сайте
            </Button>
        </div>
        
        <a href="https://sushipicca74-co-co.iikoweb.ru/external-menu/index.html#/external-menu" class="underline pl-10" target="_blank">Перейти в IIKO WEB</a>
    </div>

    
    <div class="flex items-start gap-3 mb-8 mx-4 mt-4">
        <div class="w-max rounded-xl shadow-md py-2 px-4 border">
            <Pagination.Root count={row_count} perPage={rows_per_page} let:pages={pages} let:currentPage={current_page}>
                <Table.Root class="min-h-[300px] min-w-[500px] my-2">
                    <Table.Header>
                        <Table.Row class="cursor-default mx-4 my-2 *:p-1">
                            <Table.Head>Изображение</Table.Head>
                            <Table.Head class="relative w-40">
                                <Input type="text" placeholder="Название" bind:value={filters.name} />
                                <button on:click={() => filters.name = ''} class="absolute top-1/2 right-3 transform -translate-y-1/2"><Cross2 class="w-3 h-3 text-gray-400" /></button>
                            </Table.Head>
                            <Table.Head>Фильтры</Table.Head>
                            <Table.Head>Удалить</Table.Head>

                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {#if products.length > 0}
                            {#each products.slice((current_page - 1) * rows_per_page, current_page * rows_per_page) as product (product.iiko_id) }		
                                <Table.Row class="even:bg-gray-50 dark:even:bg-stone-800">
                                    <Table.Cell>
                                        <Dialog.Root onOpenChange={(open) => {
                                            if (!open) {
                                                not_saved_img.forEach(img => { utils.deleteImg(img) });
                                                not_saved_img = [];
                                            }}}>
                                            <Dialog.Trigger on:click={() => { edit_product = structuredClone(product); img_to_delete = []}} class="!outline-none relative">
                                                {#if product.mark?.length > 0}
                                                    <div class="absolute top-0 left-0 flex gap-1 items-center">
                                                        {#each product.mark as mark}
                                                        {@const img_name = mark == 'остро' ? 'hot' : 'new'}
                                                            <img src="img/{img_name}.svg" alt="{mark} {product.iiko_id}" class="h-3">
                                                        {/each}
                                                    </div>
                                                {/if}
                                                {#if product.img?.length > 0}
                                                    <img src="{imgproxy_path(product.img[0], '160', '106')}" alt={product.name} class="w-36 rounded" onerror={this.src='img/error.png'}>
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
                                                                        on:click={() => {
                                                                            img_to_delete.push(img);
                                                                            edit_product.img = edit_product.img.filter((_, i) => i !== index)
                                                                        }}
                                                                        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { edit_product.img = edit_product.img.filter((_, index) => index !== index) } }}>
                                                                        <CrossCircled class="text-red-600 h-5 w-5 ml-1" />
                                                                    </div>
                                                                </div>
                                                                <p class="text-[12px] w-20 text-wrap break-all">{(img !== 'load') ? img : 'Дождитесь загрузки файла!'}</p>
                                                            </div>
                                                        {/each}
                                                    </div>
                                                    {/if}
                                                    <label class="cursor-pointer" on:change={uploadFile}>
                                                        <input type="file" class="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />
                                                        <Button variant="outline" class="pointer-events-none">
                                                            <PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> 
                                                            Добавить файл
                                                        </Button>
                                                    </label>
                                                </div>

                                                {#if edit_product?.group === "Наборы"}
                                                    <div class="flex w-full items-start">
                                                        <p class="font-semibold text-sm mr-2 mt-0.5">Состав&nbspнабора:</p>
                                                        <div class="flex items-start w-full">
                                                            <Popover.Root bind:open={open.compose_new} let:ids>
                                                                <Popover.Trigger asChild let:builder class="w-60 !outline-none">
                                                                    <Button
                                                                        builders={[builder]}
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        class="border-none p-0 m-0 hover:bg-transparent shadow-none rounded-full h-min"
                                                                    >
                                                                        <PlusCircled class="text-gray-400 h-5 w-5 mt-[3px] mr-2" />
                                                                    </Button>
                                                                </Popover.Trigger>
                                                                <Popover.Content class="p-0">
                                                                    <ScrollArea class="h-72">
                                                                        <Command.Root>
                                                                            <Command.Input placeholder="Поиск" class="h-9" />
                                                                            <Command.Empty>Не найдено</Command.Empty>
                                                                            <Command.Group>
                                                                                {#each $_store.products_iiko.filter(p => p.group == 'Роллы') as p}
                                                                                    <Command.Item
                                                                                        value={p.name}
                                                                                        onSelect={() => {
                                                                                        if (edit_product.compos) {
                                                                                            if (!edit_product.compos.some(item => item === p.iiko_id)) {
                                                                                                edit_product.compos = [...edit_product.compos, p.iiko_id];
                                                                                            }
                                                                                        } else edit_product.compos = [p.iiko_id];
                                                                                        closeAndFocusTrigger(ids.trigger);
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
                                                                    {@const roll = $_store.products_iiko.find(p => p.iiko_id === item) ?? {name: 'Удалённый товар'}}
                                                                        <div role="button"
                                                                            tabindex="0"
                                                                            aria-label="Удалить элемент" 
                                                                            on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { edit_product.compos = edit_product.compos.filter((_, index) => index !== i) } }} 
                                                                            on:click={() => edit_product.compos = edit_product.compos.filter((_, index) => index !== i)}
                                                                        >
                                                                            <Badge variant="outline" class="cursor-pointer mr-2 mb-1">
                                                                                {roll.name} 
                                                                                <Cross2 class="h-2.5 w-2.5 ml-1 2 mt-0.5" />
                                                                            </Badge>
                                                                        </div>
                                                                    {/each}
                                                                {/if}
                                                            </div>
                                                        </div>
                                                    </div>
                                                {/if}

                                                <Dialog.Close class="w-min">
                                                    <Button type="submit" on:click={() =>{ 
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
                                                    <Button class="w-full" on:click={() => delete_product(product.iiko_id)}>Удалить</Button>
                                                </Dialog.Close>
                                            </Dialog.Content>
                                        </Dialog.Root>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        {/if}
                    </Table.Body>
                </Table.Root>

                <Pagination.Content>
                    <Pagination.Item>
                        <Pagination.PrevButton />
                    </Pagination.Item>
                    {#each pages as page (page.key)}
                        {#if page.type === "ellipsis"}
                        <Pagination.Item>
                            <Pagination.Ellipsis />
                        </Pagination.Item>
                        {:else}
                        <Pagination.Item isVisible={current_page == page.value}>
                            <Pagination.Link {page} isActive={current_page == page.value}>
                                {page.value}
                            </Pagination.Link>
                        </Pagination.Item>
                        {/if}
                    {/each}
                    <Pagination.Item>
                        <Pagination.NextButton />
                    </Pagination.Item>
                </Pagination.Content>
                
                {#if products.length <= rows_per_page*(current_page - 1)  && !page_is_loading}
                    <span class="hidden">{current_page = 1}</span> 
                {/if}
            </Pagination.Root>
        </div>

        <div class="flex flex-wrap items-start gap-3">
            {#if logs.sets_without_count.length > 0}
                <div class="shadow-lg rounded-xl px-4 py-2 max-w-[270px] bg-red-100">
                    <div class="flex gap-3 items-center">
                        <ExclamationTriangle class="text-primary w-5" />
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
                        <ExclamationTriangle class="text-primary w-5" />
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
                        <ExclamationTriangle class="text-primary w-5" />
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

            

            <!-- {#if $_store.products_iiko.find(p => p.group == 'Закуски' && (p.count || p.count !== 0))}
                <div class="border shadow-lg rounded-xl px-4 py-2 max-w-[280px]">
                    <div class="flex gap-3 items-center">
                        <p class="font-bold">Закуски с количеством:</p>
                    </div>
                    <ul class="ml-12 list-disc">
                        {#each $_store.products_iiko.filter(p => p.group == 'Закуски' && (p.count || p.count !== 0)) as product}
                            <li>{product.name}</li>
                        {/each}
                    </ul>
                </div>
            {/if} -->

            
            
        </div>
    </div>
        
</div>