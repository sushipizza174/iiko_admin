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
    import {X, Plus, ChevronsUpDown, Check, AlertTriangle} from "@lucide/svelte";
    import { _products_iiko, _city, _site_settings } from '$lib/store.svelte';
    import { get, put } from "$lib/server";

    let products = $state([]);
    // let products_orig = []
    let edit_product = $state();
    let group_names = $state();
    let is_loading  = $state(false);
    let is_update_disabled = $state(false);
    let open_group = $state(false);

    let rows_per_page = 10;
    let row_count = 1;
    let page_is_loading = false;

    let filters = $state({
        name: null, 
        group: null,
    })

    let selected_group = $derived((group_names?.find((g) => g.toLowerCase().includes(filters.group?.toLowerCase())) ?? "Группа")
        .slice(0, 24) + (group_names?.find((g) => g.toLowerCase().includes(filters.group?.toLowerCase()))?.length > 24 ? '...' : ''))
    
     onMount( async () => {
        try {
            const data = await get(`products?city=${_city}&type=stage`);
            _products_iiko.list = Array.isArray(data) ? data : [];
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
</div>