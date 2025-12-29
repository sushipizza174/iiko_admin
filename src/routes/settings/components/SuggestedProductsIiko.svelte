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
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

    export let city_name = ''
    export let city = ''
    export let edit_site_settings

    let open = {}
    let products = []
    let suggested_products = []
    let edit_setting

    beforeUpdate(()=>{
        products = $_store.products_iiko || [];
        Init_SetIems()
    })

    const Init_SetIems = () => {
        if ($_store.load_settings) {
            suggested_products = $_store.site_settings.find(s => s.id == 'suggested_products_iiko')?.data
        }
    }

    let name_suggested_prod;

    $: selected_suggested_prod = (products.find((p) => p.name == name_suggested_prod)?.name ?? "Добавить товар")
    .slice(0, 20) + (products.find((p) => p.name == name_suggested_prod)?.name.length > 20 ? '...' : '');

    // для закрытия popover
    const closeAndFocusTrigger = (triggerId) => {
        for (const key in open) {
            open[key] = false;
        }
        tick().then(() => { document.getElementById(triggerId)?.focus() });
    }
</script>


<div class="w-full my-8">
    <p class="font-bold mb-2 scroll-mt-[70px]" id='suggested_products_iiko'>Дополнительные товары IIKO {city_name}</p>
    <Popover.Root bind:open={open.suggested_products_iiko } let:ids>
        <Popover.Trigger asChild let:builder class="w-60 !outline-none">
            <Button
                builders={[builder]}
                variant="outline"
                role="combobox"
                class="w-60 font-normal justify-between"
            >
                {selected_suggested_prod}
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
                                value={p.name}
                                onSelect={(currentValue) => {
                                name_suggested_prod = currentValue;
                                if (!suggested_products || !suggested_products?.find(i => i.id == p.iiko_id && i.city == city)) {
                                    edit_site_settings('suggested_products_iiko', { id: p.iiko_id, city })
                                } else {
                                    toast.warning("Ошибка!", {
                                        description: `Товар ${p.name} уже добавлен`,
                                        action: { label: "Закрыть",	onClick: () => console.info("") },
                                        position: 'top-right',
                                    })
                                }
                                closeAndFocusTrigger(ids.trigger);
                            }}
                            >
                                <Check class={cn( "mr-2 h-4 w-4",  name_suggested_prod !== p.name && "text-transparent")}  />
                                {p.name}
                            </Command.Item>
                        {/each}
                    </Command.Group>
                </Command.Root>
            </ScrollArea>
            
        </Popover.Content>
    </Popover.Root>

    <div class="grid grid-cols-3 mt-5">
        {#if suggested_products && suggested_products.length > 0}
        {@const suggested_products_city = suggested_products.filter(p=> p.city == city) || []}
        {#if suggested_products_city.length > 0}
            {#each suggested_products_city as p}
            {@const product = products.find(product => product.iiko_id === p.id)}
            {@const globalIndex = suggested_products.findIndex(item => item.id === product?.iiko_id && item.city == city)}
                <div class="flex items-center space-x-3">
                    <p>{product?.name || '-'}</p>

                    <Dialog.Root>
                        <Dialog.Trigger><CrossCircled class="text-red-600 h-5 w-5 ml-1 !outline-none" /></Dialog.Trigger>
                        <Dialog.Content class="sm:max-w-[425px]">
                            <Dialog.Header>
                                <Dialog.Title>Вы уверены, что хотите удалить доп. товар {product?.name || '-'}?</Dialog.Title>
                                <Dialog.Description>Данное действие невозможно отменить.</Dialog.Description>
                              </Dialog.Header>
                              <Dialog.Close class="w-full">
                                <Button 
                                    class="w-full"
                                    on:click={()=> {
                                        if (globalIndex !== -1) {
                                            edit_site_settings('suggested_products_iiko', null, globalIndex)
                                            toast.success("Успешно!", {
                                                description: `Доп. товар "${product?.name || '-'}" удален`,
                                                action: { label: "Закрыть", onClick: () => console.info("") },
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