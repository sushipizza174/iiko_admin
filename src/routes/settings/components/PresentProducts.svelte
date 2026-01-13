<script lang="ts">
    // @ts-nocheck
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
    import { MinusCircle } from "@lucide/svelte";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
	import { Separator } from "$lib/components/ui/separator";
    import {_config, _products_iiko, _site_settings} from "$lib/store.svelte.js"
    import * as RadioGroup from "$lib/components/ui/radio-group";


    let {
		city_name = '',
		city = '',
		edit_site_settings
	} = $props();

    let edit_setting = $state({})
    let present_products = $derived(
        Array.isArray(_site_settings?.list)
            ? _site_settings.list.find(s => s.id == 'present_products_iiko')?.data ?? []
            : []
    );
    let popover_open = $state(false);
    let dialog_open = $state(false);
    let products = $derived(_products_iiko.list || []);

    let new_day = $state('')

    let add_setting = $state({
        new_bonus: null,
        min_price: null,
        new_prod: null,
        selected_item_id: null,
        modifiers: [],
        days_close: [],
        new_modif: '',
    })

</script>


<div class="w-full my-8">
	<p class="font-bold mb-2 scroll-mt-[70px]" id="present_products">Подарки на акции {city_name}</p>
	<div class="flex flex-wrap justify-items-stretch gap-x-10 gap-y-5">
		{#if present_products && present_products.length > 0}
		{@const bonus_city = present_products.filter(i => i.city == city) || []}
			{#if bonus_city && bonus_city.length > 0}
				{#each bonus_city as bonus, index_group}
				{@const global_index = present_products.findIndex(item => item.id === bonus.id)}
					<div class="flex flex-col max-w-[360px]">
                        <div class="rounded-md border p-1.5">
                            <div class="bg-gray-200 dark:bg-gray-700 flex items-center justify-between rounded-md p-1.5 mb-2">
                                <div class="flex flex-col gap-1">
                                    <p class="font-semibold">{bonus.type}</p>

                                    {#if bonus.min_price}
                                        <p class="text-xs">Минимальная стоимость заказа: {bonus.min_price} ₽</p>
                                    {/if}

                                    {#if bonus.days_close?.length > 0}
                                        <p class="text-xs">Дни отмены акции: {bonus.days_close.join(', ')}</p>
                                    {/if}
                                </div>

                                <!-- Редактировать название -->
                                <Dialog.Root>
                                    <Dialog.Trigger class="!outline-none" onclick={() => {edit_setting = { ...bonus }}}><Pencil class="h-5 w-5" /></Dialog.Trigger>
                                    <Dialog.Content class="sm:max-w-[425px]">
                                        <Dialog.Header>
                                            <Dialog.Title>Редактировать</Dialog.Title>
                                        </Dialog.Header>
                                        
                                        <div class="flex flex-col gap-2">
                                            <Label>Название акции</Label>
                                            <Input bind:value={bonus.type} class="w-full" />
                                        </div>
                                        
                                        <div class="flex flex-col gap-2">
                                            <Label>Минимальная стоимость заказа (не обязательно)</Label>
                                            <Input bind:value={bonus.min_price} class="w-full" type="number" input={(event) => bonus.min_sum = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')}  />
                                        </div>

                                        <div class="flex flex-col gap-2">
                                            <Label>Дни отмены акции (не обязательно)</Label>
                                            <div>
                                                <div class="flex w-full gap-2">
                                                    <Input placeholder="дд-мм" bind:value={new_day} />
                                                    <button onclick={() => {
                                                        if (new_day.trim() !== '') {
                                                            if (!bonus.days_close) bonus.days_close = []
                                                            bonus.days_close.push(new_day.trim())
                                                            new_day = ''
                                                        }
                                                    }}>
                                                        <PlusCircle />
                                                    </button>
                                                </div>

                                                {#if bonus.days_close?.length > 0}
                                                    {#each bonus.days_close as day, index}
                                                        <div class="flex gap-2 w-full mt-1">
                                                            <p>{day}</p>
                                                            <button 
                                                                class="text-red-600" 
                                                                onclick={() => bonus.days_close = bonus.days_close.filter((_, i) => i !== index)}
                                                            >
                                                                <MinusCircle />
                                                            </button>
                                                        </div>
                                                    {/each}
                                                {/if}
                                            </div>
                                        </div>

                                        <Dialog.Close>
                                            <Button 
                                                class="w-full"
                                                disabled={new_day !== ''}
                                                onclick={() => {
                                                    if (global_index !== -1) {
                                                        edit_site_settings('present_products_iiko', bonus, null, global_index)
                                                    }
                                                }}
                                            >
                                                Сохранить
                                            </Button>
                                        </Dialog.Close>
                                        
                                    </Dialog.Content>
                                </Dialog.Root>
                            </div>

                            <!-- Выбор нового товара в акцию -->
                            <Popover.Root bind:open={popover_open}>
                                <Popover.Trigger asChild class="w-60 !outline-none">
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        class="w-full font-normal justify-between"
                                    >
                                        Добавить товар
                                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                                        onSelect={() => {
                                                            edit_setting = { ...bonus }
                                                            dialog_open = true;
                                                            add_setting.new_prod = p;
                                                            add_setting.selected_item_id = add_setting.new_prod.items[0].id
                                                            popover_open = false;
                                                        }}
                                                    >
                                                        {p.name}
                                                    </Command.Item>
                                                {/each}
                                            </Command.Group>
                                        </Command.Root>
                                    </ScrollArea>
                                </Popover.Content>
                            </Popover.Root>

                            <!-- Диалоговое окно, которое открывается при выборе товара -->
                            <Dialog.Root bind:open={dialog_open}>
                                <Dialog.Content>
                                    <Dialog.Header><Dialog.Title>Выберите нужный подтовар</Dialog.Title></Dialog.Header>
                                    <ScrollArea class="max-h-[70vh]">
                                        {#if add_setting.new_prod}
                                            <div class="gap-4">
                                            
                                                {#if add_setting.new_prod.items.length > 0}
                                                    <p>{add_setting.new_prod.name}</p>
                                                    
                                                    <RadioGroup.Root bind:value={add_setting.selected_item_id}>
                                                        {#each add_setting.new_prod.items as item}
                                                            <div class="flex items-start space-x-2">
                                                                <RadioGroup.Item value={item.id} id={item.id} class="mt-1" />
                                                                <label for={item.id} class="text-sm">{item.size} <br/> {item.id}</label>
                                                            </div>
                                                        {/each}
                                                    </RadioGroup.Root>

                                                    <Separator class="my-2"/>

                                                    <div class="my-4 pl-1">
                                                        <div class="flex w-full gap-2 mt-4">
                                                            <Input placeholder="id модификатора" bind:value={add_setting.new_modif} />
                                                            <button onclick={() => {
                                                                if (add_setting.new_modif.trim() !== '') {
                                                                    add_setting.modifiers.push(add_setting.new_modif.trim())
                                                                    add_setting.new_modif = ''
                                                                }
                                                            }}>
                                                                <PlusCircle />
                                                            </button>
                                                        </div>

                                                        {#if add_setting.modifiers?.length > 0}
                                                            {#each add_setting.modifiers as modif, index}
                                                                <div class="flex gap-2 w-full mt-1">
                                                                    <p>{modif}</p>
                                                                    <button 
                                                                        class="text-red-600" 
                                                                        onclick={() => add_setting.modifiers = add_setting.modifiers.filter((_, i) => i !== index)}
                                                                    >
                                                                        <MinusCircle />
                                                                    </button>
                                                                </div>
                                                            {/each}
                                                        {/if}
                                                    </div>
                                                {/if}
                                            </div>
                                        {/if}

                                        <Dialog.Close>
                                            <Button onclick={() => { 
                                                let global_index = present_products.findIndex(item => item.id === edit_setting.id)
                                                if (global_index !== -1) {
                                                    if (edit_setting.items.some(i => i.id == add_setting.selected_item_id)) {
                                                        toast.warning("Ошибка!", {
                                                            description: `Такой товар в данной акции уже существует`,
                                                            action: { label: "Закрыть",	onClick: () => console.info("") },
                                                            position: 'top-right',
                                                        })
                                                    } else {
                                                        edit_setting.items.push({id: add_setting.selected_item_id, modifiers: add_setting.modifiers})
                                                        edit_site_settings('present_products_iiko', edit_setting, null, global_index)
                                                    }
                                                } else {
                                                    toast.warning("Ошибка!", {
                                                        description: `Что-то пошло не так`,
                                                        action: { label: "Закрыть",	onClick: () => console.info("") },
                                                        position: 'top-right',
                                                    })
                                                }
                                            }}
                                                class="w-full"
                                                disabled={add_setting.new_modif !== ''}
                                            >
                                                Сохранить
                                            </Button>
                                        </Dialog.Close>
                                    </ScrollArea>
                                </Dialog.Content>
                            </Dialog.Root>
                            
                            <div class="text-start px-1.5">
                                {#if bonus.items?.length > 0 && products.length > 0}
                                    {#each bonus.items as item, index}
                                        {@const product = products?.find(p => p.items?.some(i => i.id == item.id))}
                                        {#if product}
                                        {@const select_item = product.items?.find(i => i.id == item.id)}
                                            {#if index !== 0}
                                                <Separator />
                                            {/if}
                                            <div class="flex justify-between my-1.5 gap-3 items-start">
                                                <div>
                                                    <p>{product.name} {select_item.size}</p>
                                                    <p class="text-xs">ID: {select_item.id}</p>
                                                    {#if item.modifiers?.length > 0}
                                                        <p class="text-xs">Модификаторы: {item.modifiers.join(', ')}</p>
                                                    {/if}
                                                </div>
                                                <button></button>
                                                <Dialog.Root>
                                                    <Dialog.Trigger class="!outline-none"><XCircle class="h-5 w-5 text-primary" /></Dialog.Trigger>
                                                    <Dialog.Content class="sm:max-w-[425px]">
                                                        <Dialog.Header>
                                                            <Dialog.Title>Вы уверены, что хотите удалить из акции {bonus.type} товар {select_item.name}?</Dialog.Title>
                                                            <Dialog.Description>Данное действие невозможно отменить.</Dialog.Description>
                                                        </Dialog.Header>
                        
                                                        <Dialog.Close class="flex justify-between">
                                                            <Button variant="secondary">Отмена</Button>
                        
                                                            <Button onclick={() => {
                                                                if (global_index !== -1) {
                                                                    bonus.items = bonus.items.filter((_, i) => i !== index)
                                                                    edit_site_settings('present_products_iiko', bonus, null, global_index)
                                                                    toast.success("Успешно!", {
                                                                        description: `Товар "${select_item.name}" удалён из акции ${bonus.type}`,
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
                                                                
                                                            }}>
                                                                Удалить
                                                            </Button>
                                                        </Dialog.Close>
                                                    </Dialog.Content>
                                                </Dialog.Root>
                                            </div>
                                        {/if}
                                    {/each}     
                                {/if}
                            </div>
                        </div>

						<!-- Удалить -->
						<Dialog.Root>
							<Dialog.Trigger class="!outline-none">
								<button class="flex items-center underline underline-offset-4 gap-2 text-red-600 mt-2 pl-3 text-sm">
										Удалить акцию <XCircle class="h-5 w-5 mt-1" />
								</button>
							</Dialog.Trigger>
							<Dialog.Content class="sm:max-w-[425px]">
								<Dialog.Header>
									<Dialog.Title>Вы уверены, что хотите удалить акцию?</Dialog.Title>
									<Dialog.Description>Данное действие невозможно отменить.</Dialog.Description>
								</Dialog.Header>

								<Dialog.Close class="flex justify-between">
									<Button variant="secondary">Отмена</Button>

									<Button onclick={() => {
										if (global_index !== -1) {
											edit_site_settings('present_products_iiko', null, global_index)
											toast.success("Успешно!", {
												description: `Акция "${bonus.type}" удалена`,
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
									}}>
										Удалить
									</Button>
								</Dialog.Close>
							</Dialog.Content>
						</Dialog.Root>
							
					</div>
				{/each}
			{/if}
		{/if}

		<!-- Добавить акцию -->
		<Popover.Root>
			<Popover.Trigger asChild class="!outline-none">
				<Button variant="outline"><PlusCircle class="text-gray-400 h-4 w-4 mr-2"/> Добавить акцию</Button>
			</Popover.Trigger>
			<Popover.Content class="w-max" align="start">
                <div class="flex flex-col gap-2">
                    <Label>Название акции на латинице:</Label>
				    <Input placeholder="Пример: birthday" bind:value={add_setting.new_bonus} />
                </div>
				
				{#if present_products?.some(item => item.type === add_setting.new_bonus && item.city === city)}
					<p class="text-red-600 text-xs mt-2">Такая акция в {city_name}е уже существует</p>
				{/if}

                <div class="flex flex-col gap-2 mt-4">
                    <Label>Минимальная сумма заказа (не обязательно):</Label>
				    <Input type="number" bind:value={add_setting.min_price} oninput={(event) => edit_setting.min_sum = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')}  />
                </div>

                <div class="flex flex-col gap-2 mt-4">
                    <Label>Дни отмены акции (не обязательно):</Label>
                    <div>
                        <div class="flex w-full gap-2">
                            <Input placeholder="дд-мм" bind:value={new_day} />
                            <button onclick={() => {
                                if (new_day.trim() !== '') {
                                    add_setting.days_close.push(new_day.trim())
                                    new_day = ''
                                }
                            }}>
                                <PlusCircle />
                            </button>
                        </div>

                        {#if add_setting.days_close?.length > 0}
                            {#each add_setting.days_close as day, index}
                                <div class="flex gap-2 w-full mt-1">
                                    <p>{day}</p>
                                    <button 
                                        class="text-red-600" 
                                        onclick={() => add_setting.days_close = add_setting.days_close.filter((_, i) => i !== index)}
                                    >
                                        <MinusCircle />
                                    </button>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>
                

                <Button class="mt-2 w-full"
                    disabled={present_products?.some(item => item.type === add_setting.new_bonus && item.city === city) || new_day !== ''}
                    onclick={() => {
                       const existingIds = present_products?.map(item => item.id) || [];
                       const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
                       edit_site_settings('present_products_iiko', {
                                                                id: maxId + 1, 
                                                                type: add_setting.new_bonus, 
                                                                min_price: add_setting.min_price, 
                                                                days_close: add_setting.days_close,
                                                                items: [], 
                                                                city
                                                            }) 
                       add_setting.new_bonus = null
                       add_setting.min_price = null
                    }}
                >
                    Добавить
                </Button>
			</Popover.Content>
		</Popover.Root>
	</div>
</div>