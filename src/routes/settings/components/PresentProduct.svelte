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
    import { Separator } from "$lib/components/ui/separator";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Label } from "$lib/components/ui/label/index.js";

    export let city_name = ''
    export let city = ''
    export let edit_site_settings

    let open = {}
    let products = []
    let present_product = []
    let edit_setting

    let add_setting = {
        present_product: {},
	    price_for_present: null,
    }


    beforeUpdate(()=>{
        products = $_store.products || [];
        Init_SetIems()
    })

    const Init_SetIems = () => {
        if ($_store.load_settings) {
            present_product = $_store.site_settings.find(s => s.id == 'present_product')?.data
        }
    }

    $: selectedPresentProdEdit = (products.find((p) => p.data.name == edit_setting?.name)?.data.name ?? "Изменить товар")
    .slice(0, 20) + (products.find((p) => p.data.name == edit_setting?.name)?.data.name.length > 20 ? '...' : '');

    $: selectedPresentProd = (products.find((p) => p.data.name == add_setting.present_product?.name)?.data.name ?? "Добавить товар")
    .slice(0, 28) + (products.find((p) => p.data.name == add_setting.present_product?.name)?.data.name.length > 28 ? '...' : '');

    // для закрытия popover
    const closeAndFocusTrigger = (triggerId) => {
        for (const key in open) {
            open[key] = false;
        }
        tick().then(() => { document.getElementById(triggerId)?.focus() });
    }
</script>

<div>
    <p class="font-bold scroll-mt-[70px]" id="present_product">Товар в подарок {city_name}</p>
    <div class="flex">
        <!-- Обновление существующего товара -->
        {#if present_product && present_product?.find(p => p.city == city)}
        {@const city_product = present_product?.find(p => p.city == city)}
        {@const city_product_index = present_product?.findIndex(p => p.city == city)}

            {#if city_product}
                <p>{city_product.name}, в подарок от: {city_product.price_for_present}₽</p>

                <Dialog.Root>
                    <Dialog.Trigger on:click={() => edit_setting = {...city_product}} class="!outline-none">
                        <Pencil2 class="h-5 w-5 ml-3" />
                    </Dialog.Trigger>
                    <Dialog.Content class="sm:max-w-[425px]">
                        <Dialog.Header><Dialog.Title>Изменить подарочный товар</Dialog.Title></Dialog.Header>
                        
                        <div class="flex gap-2">
                            <Input bind:value={edit_setting.price_for_present} placeholder="Сумма для корзины" type="number" min=0 class="w-40" />

                            <Popover.Root bind:open={open.present_product} let:ids>
                                <Popover.Trigger asChild let:builder class="w-60 !outline-none">
                                    <Button
                                        builders={[builder]}
                                        variant="outline"
                                        role="combobox"
                                        class="w-52 font-normal justify-between"
                                    >
                                        {selectedPresentProdEdit}
                                        <CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </Popover.Trigger>
                                <Popover.Content class="p-0">
                                    <ScrollArea class="h-72 rounded-md">
                                        <Command.Root>
                                            <Command.Input placeholder="Поиск" class="h-9" />
                                            <Command.Empty>Не найдено</Command.Empty>
                                            <Command.Group>
                                                {#each products as p}
                                                    <Command.Item
                                                        value={p.data.name}
                                                        onSelect={(currentValue) => {
                                                        edit_setting.id = p.id
                                                        if (p.prod) {
                                                            edit_setting.name = p.prod.name
                                                            edit_setting.title = p.prod.title
                                                            edit_setting.compos = p.prod.compos
                                                            edit_setting.description = p.prod.description
                                                            edit_setting.meta = p.prod.meta
                                                            edit_setting.img = p.prod.img
                                                            edit_setting.items = p.prod.items
                                                            edit_setting.mark = p.prod.mark
                                                            edit_setting.group = p.prod.group
                                                            edit_setting.price = p.prod.items[0].price || 0
                                                            edit_setting.weight = p.prod.weight
                                                        } else {
                                                            toast.warning("Ошибка! Товар не найден", {
                                                                description: `Обновите базу данных на сайте`,
                                                                action: { label: "Закрыть",	onClick: () => console.info("") },
                                                                position: 'top-right',
                                                            })
                                                        }
                                                                
                                                        closeAndFocusTrigger(ids.trigger);
                                                    }}
                                                    >
                                                        <Check class={cn( "mr-2 h-4 w-4",  edit_setting.name !== p.data.name && "text-transparent")}  />
                                                        {p.data.name}
                                                    </Command.Item>
                                                {/each}
                                            </Command.Group>
                                        </Command.Root>
                                    </ScrollArea>
                                    
                                </Popover.Content>
                            </Popover.Root>
                        </div>
                            
                        <Dialog.Close>
                            <div class="flex justify-between items-center mt-5">
                                <button 
                                    class="flex items-center underline underline-offset-4 gap-2 text-red-600" 
                                    on:click={() => edit_site_settings('present_product', null, city_product_index)}>
                                    Удалить <CrossCircled class="h-5 w-5 mt-1" />
                                </button>

                                <Button 
                                    disabled={!edit_setting.price_for_present} 
                                    on:click={() => edit_site_settings('present_product', edit_setting, null, city_product_index)}>
                                    Сохранить
                                </Button>
                            </div>
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Root>
            {/if}
        {:else}
        <!-- Добавление нового товара -->
        <div class="flex gap-2 mt-3">
            <Input bind:value={add_setting.price_for_present} placeholder="Сумма для корзины" type="number" min=0 class="w-48" />

            <Popover.Root bind:open={open.present_product} let:ids>
                <Popover.Trigger asChild let:builder class="w-60 !outline-none">
                    <Button
                        builders={[builder]}
                        variant="outline"
                        role="combobox"
                        class="w-60 font-normal justify-between"
                    >
                        {selectedPresentProd}
                        <CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </Popover.Trigger>
                <Popover.Content class="p-0">
                    <ScrollArea class="h-72 rounded-md">
                        <Command.Root>
                            <Command.Input placeholder="Поиск" class="h-9" />
                            <Command.Empty>Не найдено</Command.Empty>
                            <Command.Group>
                                {#each products as p}
                                    <Command.Item
                                        value={p.data.name}
                                        onSelect={(currentValue) => {
                                        if (p.prod) {
                                            add_setting.present_product = {
                                                id: p.id,
                                                name: p.prod.name,
                                                title: p.prod.title,
                                                compos: p.prod.compos,
                                                description: p.prod.description,
                                                meta: p.prod.meta,
                                                img: p.prod.img,
                                                items: p.prod.items,
                                                mark: p.prod.mark,
                                                group: p.prod.group,
                                                price: p.prod.items[0].price || 0,
                                                weight: p.prod.weight,
                                                city,
                                                price_for_present: add_setting.price_for_present,
                                            }
                                        } else {
                                            toast.warning("Ошибка! Товар не найден", {
                                                description: `Обновите базу данных на сайте`,
                                                action: { label: "Закрыть",	onClick: () => console.info("") },
                                                position: 'top-right',
                                            })
                                        }
                                        
                                        closeAndFocusTrigger(ids.trigger);
                                    }}
                                    >
                                        <Check class={cn( "mr-2 h-4 w-4",  add_setting.present_product?.name !== p.data.name && "text-transparent")}  />
                                        {p.data.name}
                                    </Command.Item>
                                {/each}
                            </Command.Group>
                        </Command.Root>
                    </ScrollArea>
                    
                </Popover.Content>
            </Popover.Root>

            <Button 
                disabled={!add_setting.price_for_present || !add_setting.present_product}
                on:click={() => edit_site_settings('present_product', {...add_setting.present_product, price_for_present: add_setting.price_for_present})}>

                Добавить
            </Button>
        </div>
        {/if}
    </div>
</div>