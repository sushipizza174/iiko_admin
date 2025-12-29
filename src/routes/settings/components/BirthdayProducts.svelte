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
    import Check from "svelte-radix/Check.svelte";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog";
    import PlusCircled from "svelte-radix/PlusCircled.svelte";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

    export let city_name = ''
    export let city = ''
    export let edit_site_settings

    let open = {}
    let products = []
    let birthday_products = []
    let edit_setting
    let new_present_product_name


    beforeUpdate(()=>{
        products = $_store.products || [];
        Init_SetIems()
    })

    const Init_SetIems = () => {
        if ($_store.load_settings) {
            birthday_products = $_store.site_settings.find(s => s.id == 'birthday_products')?.data
        }
    }

    // для закрытия popover
    const closeAndFocusTrigger = (triggerId) => {
        for (const key in open) {
            open[key] = false;
        }
        tick().then(() => { document.getElementById(triggerId)?.focus() });
    }

    $: selectedBirthdayProd = (products.find((p) => p.data.name == new_present_product_name)?.data.name ?? "Добавить товар")
        .slice(0, 20) + (products.find((p) => p.data.name == new_present_product_name)?.data.name.length > 20 ? '...' : '');

</script>

<div class="w-full my-8">
    <p class="font-bold mb-2 scroll-mt-[70px]" id="birthday_products">Подарочные товары в др {city_name}</p>
    <Popover.Root bind:open={open.birthday_products} let:ids>
        <Popover.Trigger asChild let:builder class="w-60 !outline-none">
            <Button
                builders={[builder]}
                variant="outline"
                role="combobox"
                class="w-60 font-normal justify-between"
            >
                {selectedBirthdayProd}
                <CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </Popover.Trigger>
        <Popover.Content class="p-0">
            <ScrollArea class="h-72 rounded-md">
                <Command.Root>
                    <Command.Input placeholder="Поиск" class="h-9" />
                    <Command.Empty>Не найдено</Command.Empty>
                    <Command.Group>
                        {#each $_store.products as p}
                            <Command.Item
                                value={p.data.name}
                                onSelect={(currentValue) => {
                                new_present_product_name = currentValue;
                                if (!birthday_products?.find(i => i.id == p.id && i.city == city)) {
                                    edit_site_settings('birthday_products', { id: p.id, city })
                                } else {
                                    toast.warning("Ошибка!", {
                                        description: `Товар ${p.prod.name} уже добавлен`,
                                        action: { label: "Закрыть",	onClick: () => console.info("") },
                                        position: 'top-right',
                                    })
                                }
                                closeAndFocusTrigger(ids.trigger);
                            }}
                            >
                                <Check class={cn( "mr-2 h-4 w-4",  new_present_product_name !== p.data.name && "text-transparent")}  />
                                {p.data.name}
                            </Command.Item>
                        {/each}
                    </Command.Group>
                </Command.Root>
            </ScrollArea>
        </Popover.Content>
    </Popover.Root>

    <div class="grid grid-cols-3 mt-5">
        {#if birthday_products && birthday_products.length > 0}
        {@const birthday_products_city = birthday_products.filter(p=> p.city == city) || []}
        {#if birthday_products_city.length > 0}
            {#each birthday_products_city as p}
            {@const product = products.find(product => product.id === p.id)}
            {@const globalIndex = birthday_products.findIndex(item => item.id === p.id && item.city === city)}
                <div class="flex items-center space-x-3">
                    <p>{product?.prod.name || '-'}</p>

                    <Dialog.Root>
                        <Dialog.Trigger class="!outline-none"><CrossCircled class="text-red-600 h-5 w-5 ml-1" /></Dialog.Trigger>
                        <Dialog.Content class="sm:max-w-[425px]">
                            <Dialog.Header>
                                <Dialog.Title>Вы уверены, что хотите удалить подарочный товар {product?.prod.name || '-'}?</Dialog.Title>
                                <Dialog.Description>Данное действие невозможно отменить.</Dialog.Description>
                            </Dialog.Header>
                            <Dialog.Close class="w-full">
                                <Button 
                                    class="w-full"
                                    on:click={()=> {
                                        if (globalIndex !== -1) {
                                            edit_site_settings('birthday_products', null, globalIndex)
                                            toast.success("Успешно!", {
                                                description: `Доп. товар к роллам "${product?.prod.name}" удален`,
                                                action: { label: "Закрыть",	onClick: () => console.info("") },
                                                position: 'top-right',
                                            })
                                        } else {
                                            toast.warning("Ошибка!", {
                                                description: `Что-то пошло не так`,
                                                action: { label: "Закрыть",	onClick: () => console.info("") },
                                                position: 'top-right',
                                            })
                                        }
                                    }}
                                >Удалить</Button>
                            </Dialog.Close>
                        </Dialog.Content>
                    </Dialog.Root>
                </div>
            {/each}
        {/if}
        {/if}
    </div>
</div>