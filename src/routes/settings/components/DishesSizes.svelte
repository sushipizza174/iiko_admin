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
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { Label } from "$lib/components/ui/label/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

    export let edit_site_settings

    let edit_setting
    let dishes_sizes = []
    let new_dishes_sizes = false;

    let open = {}
    let size_group = null

    let img_to_delete = []

    beforeUpdate(()=>{
        Init_SetIems()
    })

    const Init_SetIems = () => {
        if ($_store.load_settings) {
            dishes_sizes = $_store.site_settings.find(s => s.id == 'dishes_sizes')?.data
        }

        if (!new_dishes_sizes) {
			new_dishes_sizes = dishes_sizes?.reduce((acc, dish) => {
				acc[dish.group] = ''; // Начальное значение для каждой группы
				return acc;
			}, {});
		}
    }

    function add_size(index_group) {
        const category = dishes_sizes[index_group];
        const categoryName = category.group;
        const newSize = new_dishes_sizes[categoryName]?.trim();
        
        if (!newSize) return;
        if (!category.sizes)  category.sizes = [];  // Инициализация sizes, если не существует

        // Проверка на дубликат
        if (category.sizes.includes(newSize)) {
            toast.warning("Ошибка!", {
                description: `Размер "${newSize}" уже существует в категории "${categoryName}"`,
                position: 'top-right'
            });
            return;
        }

        // обновление массива
        dishes_sizes = dishes_sizes.map((item, idx) => 
            idx === index_group
                ? { ...item, sizes: [...item.sizes, newSize] }
                : item
        );

        new_dishes_sizes = { ...new_dishes_sizes, [categoryName]: '' };

        edit_site_settings('dishes_sizes', dishes_sizes[index_group], null, index_group);
        
        toast.success("Успешно!", {
            description: `Размер "${newSize}" добавлен в "${categoryName}"`,
            position: 'top-right'
        });
    }

    function delete_size(index_group, index_size) {
        dishes_sizes = [
            ...dishes_sizes.slice(0, index_group),
            {
                ...dishes_sizes[index_group],
                sizes: dishes_sizes[index_group].sizes.filter((_, i) => i !== index_size)
            },
            ...dishes_sizes.slice(index_group + 1)
        ]
        
        edit_site_settings('dishes_sizes', dishes_sizes[index_group], null, index_group)
        toast.success("Успешно!", {
            description: `Размер удален`,
            action: {label: "Закрыть", onClick: () => console.info("") },
            position: 'top-right',
        })
    }

    // для закрытия popover
    const closeAndFocusTrigger = (triggerId) => {
        for (const key in open) {
            open[key] = false;
        }
        tick().then(() => { document.getElementById(triggerId)?.focus() });
    }

    $: groupNamesProdAll = [...new Set($_store.products.map(dish => dish?.data?.group).filter(Boolean))] || [];

    $: selectedGroupSizes = (groupNamesProdAll.find((g) => g.toLowerCase().includes(size_group?.toLowerCase())) ?? "Группа")
        .slice(0, 24) + (groupNamesProdAll.find((g) => g.toLowerCase().includes(size_group?.toLowerCase()))?.length > 24 ? '...' : '');

    </script>

<div class="w-full my-8">
    <p class="font-bold mb-2 scroll-mt-[70px]" id="dishes_sizes">Размеры блюд</p>
    <div class="flex flex-wrap justify-items-stretch gap-x-10 gap-y-5">
        {#each dishes_sizes as dish, index_group}
            <div class="flex flex-col">
                <p class="font-semibold">{dish.group}</p>
                {#if dish.sizes && dish.sizes.length > 0}
                    {#each dish.sizes as size, index_size}
                        <div class="flex items-center space-x-3">
                            <p>{size}</p>

                            <!-- Удаление размера -->
                            <Dialog.Root>
                                <Dialog.Trigger class="!outline-none"><CrossCircled class="text-red-600 h-5 w-5 ml-1" /></Dialog.Trigger>
                                <Dialog.Content class="sm:max-w-[425px]">
                                    <Dialog.Header>
                                        <Dialog.Title>Вы уверены, что хотите удалить размер блюда?</Dialog.Title>
                                        <Dialog.Description>Данное действие невозможно отменить. Размер автоматически удалится из всех товаров, в которых он используется.</Dialog.Description>
                                    </Dialog.Header>
                                    <p><span class="font-bold text-red-600">Внимание!</span> У любой категории должен остаться минимум один размер. У категории Пиццы должны обязательно остаться 3 размера.</p>
                                    <Dialog.Close class="w-full">
                                        <Button 
                                            class="w-full"
                                            on:click={() => delete_size(index_group, index_size)}
                                        >Удалить</Button>
                                    </Dialog.Close>
                                </Dialog.Content>
                            </Dialog.Root>
                        </div>
                    {/each}
                {/if}
                
                <!-- Добавить размер в существующую категорию -->
                {#if new_dishes_sizes}
                <div class="mt-auto flex flex-col">
                    <Input bind:value={new_dishes_sizes[dish.group]} placeholder="Добавить" class="w-28 mt-3 mb-2" />
                    <Button 
                        disabled={!new_dishes_sizes[dish.group]?.trim()}
                        on:click={() => add_size(index_group) } 
                        class="w-28">
                        Сохранить
                    </Button>

                    <!-- Удалить категорию -->
                    <Dialog.Root>
                        <Dialog.Trigger class="!outline-none">
                            <button class="text-xs mt-2 underline text-primary text-start">Удалить категорию</button>
                        </Dialog.Trigger>
                        <Dialog.Content class="sm:max-w-[425px]">
                            <Dialog.Header>
                                <Dialog.Title>Вы уверены, что хотите удалить категорию {dish.group}?</Dialog.Title>
                                <Dialog.Description>Данное действие невозможно отменить.</Dialog.Description>
                            </Dialog.Header>
                            <Dialog.Close class="w-full">
                                <Button 
                                    class="w-full"
                                    on:click={()=> {
                                        edit_site_settings('dishes_sizes', null, index_group)
                                        toast.success("Успешно!", {
                                            description: `Категория "${dish.group}" удалена`,
                                            action: { label: "Закрыть",	 onClick: () => console.info("") },
                                            position: 'top-right',
                                        })
                                    }}
                                >Удалить</Button>
                            </Dialog.Close>
                        </Dialog.Content>
                    </Dialog.Root>
                </div>
                {/if}
            </div>
        {/each}

        <!-- Добавить категорию -->
        <Popover.Root>
            <Popover.Trigger asChild let:builder class="!outline-none">
                <Button builders={[builder]} variant="outline" class="mt-3"><PlusCircled class="text-gray-400 h-4 w-4 mr-2"/> Добавить категорию</Button>
            </Popover.Trigger>
            <Popover.Content class="w-max" align="start">
                <p class="font-bold mb-1">Добавить категорию</p>
                <div class="flex items-center space-x-2">
                    <Popover.Root bind:open={open.group_in_sizes} let:ids>
                        <Popover.Trigger asChild let:builder class="w-11/12 !outline-none">
                            <Button
                                builders={[builder]}
                                variant="outline"
                                role="combobox"
                                class="w-60 font-normal justify-between"
                            >
                                {selectedGroupSizes}
                                <CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content class="p-0">
                            <ScrollArea class="h-72 rounded-md">
                                <Command.Root>
                                    <Command.Input placeholder="Поиск" class="h-9" />
                                    <Command.Empty>Не найдено</Command.Empty>
                                    <Command.Group>
                                        {#each groupNamesProdAll as d}
                                            <Command.Item
                                                value={d}
                                                onSelect={(currentValue) => {
                                                size_group = currentValue;
                                                closeAndFocusTrigger(ids.trigger);
                                            }}
                                            >
                                                <Check class={cn( "mr-2 h-4 w-4",  size_group !== d && "text-transparent")}  />
                                                {d}
                                            </Command.Item>
                                        {/each}
                                    </Command.Group>
                                </Command.Root>
                            </ScrollArea>
                            
                        </Popover.Content>
                    </Popover.Root>
                    <Button 
                        disabled={!size_group?.trim() || dishes_sizes.some(size => size.group === size_group)}
                        on:click={() => {
                                edit_site_settings('dishes_sizes', {group: size_group})
                                new_dishes_sizes[size_group] = null
                            }}>
                        Сохранить
                    </Button>
                </div>
                {#if dishes_sizes.some(size => size.group === size_group)}
                    <p class="text-red-600 text-xs mt-2">Такая категория уже существует</p>
                {/if}
            </Popover.Content>
        </Popover.Root>
    </div>
</div>
