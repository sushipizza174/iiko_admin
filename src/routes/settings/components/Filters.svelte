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
    import { Label } from "$lib/components/ui/label/index.js";
	import { Separator } from "$lib/components/ui/separator";

    export let city_name = ''
    export let city = ''
    export let edit_site_settings

    let open = {}
    let products = []
    let filters = []
    let edit_setting

    let add_setting = {
        new_filter: null,
        all_new_filters: [],
        filters_name: null,
        filters_category_names: [],
        group_in_filters: null,
    }

    beforeUpdate(()=>{
        products = $_store.products || [];
        Init_SetIems()
    })

    const Init_SetIems = () => {
        if ($_store.load_settings) {
            filters = $_store.site_settings.find(s => s.id == 'filters')?.data
        }
    }

    $: selectedFilterCompos = $_store.products_compos?.find(item => item.id == add_setting.new_filter)?.data.name ?? "Выбрать фильтр"
    $: selectedFilterComposToCategory = $_store.products_compos?.find(item => item.id == add_setting.new_filter_to_category)?.data.name ?? "Выбрать фильтр"

    $: groupNamesProdAll = [...new Set($_store.products.map(dish => dish?.data?.group).filter(Boolean))] || [];

    $: selectedGroup = (groupNamesProdAll.find((g) => g.toLowerCase().includes(add_setting.group_in_filters?.toLowerCase())) ?? "Категория блюда")
    .slice(0, 24) + (groupNamesProdAll.find((g) => g.toLowerCase().includes(add_setting.group_in_filters?.toLowerCase()))?.length > 24 ? '...' : '');

    // для закрытия popover
    const closeAndFocusTrigger = (triggerId) => {
        for (const key in open) {
            open[key] = false;
        }
        tick().then(() => { document.getElementById(triggerId)?.focus() });
    }
</script>


<div class="w-full my-8">
	<p class="font-bold mb-2 scroll-mt-[70px]" id="filters">Фильтры {city_name}</p>
	<div class="flex flex-wrap justify-items-stretch gap-x-10 gap-y-5">
		{#if filters && filters.length > 0}
		{@const filters_city = filters.filter(f=> f.city == city) || []}
			{#if filters_city && filters_city.length > 0}
				{#each filters_city as filter, index_group}
				{@const globalIndex = filters.findIndex(item => item.id === filter.id)}
					<div class="flex flex-col">
						<Dialog.Root>
							<Dialog.Trigger on:click={() => {edit_setting = structuredClone(filter)}} class="!outline-none">
								<div class="rounded-md border w-[200px] p-1.5">
									<div class="bg-gray-200 dark:bg-gray-700 flex items-center justify-between rounded-md p-1.5">
										<p class="font-semibold">{filter.category}</p>
										<Pencil2 class="h-5 w-5" />
									</div>

									<div class="text-start px-1.5">
										{#if filter.data?.length > 0}
											{#each filter.data as item}
												<p class="font-semibold mt-2">{item.name}: </p>

												{#if item.filters?.length > 0}
													<p class="text-xs ml-2">
														{#each item.filters as category_filter, index}
															{#if index !== 0} , {/if}
															{category_filter}
														{/each}
													</p>
												{/if}
											{/each}
										{/if}
									</div>
								</div>
							</Dialog.Trigger>

							<Dialog.Content class="max-w-[1000px]">
									<ScrollArea class="h-[90vh] pr-5">
									
									<Dialog.Header><Dialog.Title>Редактировать фильтры для категории "{edit_setting.category}"</Dialog.Title></Dialog.Header>

									<!-- Добавить группу фильтра в категорию блюда -->
									<div class="mt-2 flex flex-col">
										<p>Добавить новую группу фильтров</p>
										<p class="text-xs text-gray-500 mb-5">Внимание! Если вы хотите добавить фильтры "Без помидоров" / "Без маслин" итд, добавляйте их с названием категории "Без". Эта группа должна быть первой в списке.</p>

										<div class="flex items-start gap-2 justify-between my-2">
											<div class="flex flex-col gap-2 w-full pl-[2px]">
												<Label>Название группы фильтров</Label>
												<Input placeholder="Начинка / Соус / Шапочка" bind:value={add_setting.filters_name} class="w-full" />
											</div>
			
											<!-- Добавление нового фильтра -->
											<div class="flex flex-col gap-2 w-full">
												<Label>Добавить фильтр</Label>
												<Popover.Root bind:open={open.add_filters} let:ids>
													<Popover.Trigger asChild let:builder class="w-60 !outline-none">
														<Button
															builders={[builder]}
															variant="outline"
															role="combobox"
															class="w-full font-normal justify-between"
														>
															{selectedFilterCompos}
															<CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
														</Button>

													</Popover.Trigger>
													<Popover.Content class="p-0">
														<ScrollArea class="h-72 rounded-md">
															<Command.Root>
																<Command.Input placeholder="Поиск" class="h-9" />
																<Command.Empty>Не найдено</Command.Empty>
																<Command.Group>
																	{#each $_store.products_compos.filter(c => c.data.type == filter.category) as item}
																		<Command.Item
																			value={item.data.name}
																			onSelect={(currentValue) => {
																			add_setting.new_filter = item.id;
																			if (!add_setting.all_new_filters?.includes(item.data.name)) {
																				add_setting.all_new_filters = add_setting.all_new_filters ?? []
																				add_setting.all_new_filters.push(item.data.name)
																			} else {
																				// Удаляем фильтр, если он уже существует
																				add_setting.all_new_filters = add_setting.all_new_filters.filter(
																					(f) => f !== item.data.name
																				);
																			}
																			closeAndFocusTrigger(ids.trigger);
																		}}
																		>
																			<Check class={cn( "mr-2 h-4 w-4",  !add_setting.all_new_filters?.includes(item.data.name) && "text-transparent")}  />
																			{item.data.name}
																		</Command.Item>
																	{/each}
																</Command.Group>
															</Command.Root>
														</ScrollArea>
																
													</Popover.Content>
												</Popover.Root>
											</div>

											<!-- Сохранить новый фильтр -->
											<Button class="w-full mt-[22px]" 
												disabled={!add_setting.filters_name || !add_setting.all_new_filters || add_setting.all_new_filters?.length == 0}
												on:click={() => {
													let new_filters = {name: add_setting.filters_name, filters: add_setting.all_new_filters}
													if (filter.data) {
														filter.data.push(new_filters)
													} else {
														filter.data = [new_filters]
													}
													// console.log(filter, globalIndex)
													if (globalIndex !== -1) {
														edit_site_settings('filters', filter, null, globalIndex)
														add_setting.filters_name = null
														add_setting.new_filter = null
														add_setting.all_new_filters = []
														edit_setting = { ...filter }
													} else {
														toast.warning("Ошибка!", {
															description: `Что-то пошло не так`,
															action: { label: "Закрыть",	onClick: () => console.info("") },
															position: 'top-right',
														})
													}
												}}>
												Добавить группу фильтров
											</Button>
										</div>

										<!-- Выбранные новые фильтры -->
										{#if add_setting.all_new_filters?.length > 0}
											<p class="mt-2">
												<strong>Выбранные фильтры</strong>:
												{#each add_setting.all_new_filters as filter, index}
													{#if index !== 0} , {/if}
													{filter}
												{/each}
											</p>
										{/if}

									</div>
										
									{#if edit_setting.data?.length > 0}
										<Separator class="my-5" />
										<p class="mb-2">Существующие фильтры:</p>

										{#each edit_setting.data as category, index_edit_data}
											<div class="flex justify-between items-center gap-2">
												<div class="flex items-center gap-2">
													<Label>Название группы фильтров:</Label>
													<Input 
														bind:value={category.name} 
														class="w-60" 
														on:change={() => 
															toast.warning("Внимание!", {
																description: `Не забудьте нажать кнопку Сохранить`,
																action: { label: "Закрыть",	onClick: () => console.info("") },
																position: 'top-right',
															})} />
												</div>

												<Button class="bg-black hover:bg-gray-900 dark:border dark:hover:bg-stone-900"
													on:click={() => {
														if (!edit_setting.data) return;
														edit_setting.data = edit_setting.data.filter((_, i) => i !== index_edit_data);
														// console.log(edit_setting)
														toast.warning("Внимание!", {
															description: `Не забудьте нажать кнопку Сохранить`,
															action: { label: "Закрыть",	onClick: () => console.info("") },
															position: 'top-right',
														})
												}}>
													Удалить группу фильтров
												</Button>
											</div>
												
											<Label class="mt-4">Фильтры:</Label>

											<div class="flex justify-between">
												{#if category.filters?.length > 0}
												<div>
													{#each category.filters as category_filter, filter_index}
														<div class="flex items-center justify-between text-sm gap-2 ml-5 w-60 hover:bg-gray-50 rounded px-2 py-1">
															{category_filter}
															<button on:click={() => { 
																if (!category.filters) return;
																const updatedData = [...edit_setting.data];	// Создаем копию всех категорий
																const updatedCategory = { ...category };	// Копия текущей категории
																const newFilters = [...category.filters];	// Удаляем фильтр по индексу
																newFilters.splice(filter_index, 1);
																updatedCategory.filters = newFilters;	// Применяем изменения
																updatedData[index_edit_data] = updatedCategory;
																edit_setting = {...edit_setting, data: updatedData};	// Обновляем весь edit_setting
																toast.warning("Внимание!", {
																	description: `Не забудьте нажать кнопку Сохранить`,
																	action: { label: "Закрыть",	onClick: () => console.info("") },
																	position: 'top-right',
																})
															}}>
																<CrossCircled class="text-red-600 h-5 w-5 ml-1" />
															</button>
														</div>
													{/each}
												</div>
												{/if}
												
												<!-- Добавить новый фильтр -->
												<Popover.Root>
													<Popover.Trigger asChild let:builder class="!outline-none">
														<Button builders={[builder]} variant="outline"><PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> Добавить новый фильтр</Button>
													</Popover.Trigger>
													<Popover.Content class="w-max" align="start">
														<p class="font-bold mb-1">Добавить</p>
														<div class="flex items-center flex-wrap gap-2">
															<Popover.Root bind:open={open.add_filter_to_category} let:ids>
																<Popover.Trigger asChild let:builder class="w-60 !outline-none">
																	<Button builders={[builder]} variant="outline" role="combobox" class="w-60 font-normal justify-between">
																		{selectedFilterComposToCategory}
																		<CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
																	</Button>
																</Popover.Trigger>
																<Popover.Content class="p-0">
																	<ScrollArea class="h-72 rounded-md">
																		<Command.Root>
																			<Command.Input placeholder="Поиск" class="h-9" />
																			<Command.Empty>Не найдено</Command.Empty>
																			<Command.Group>
																				{#each $_store.products_compos.filter(c => c.data.type == filter.category) as item}
																					<Command.Item
																						value={item.data.name}
																						onSelect={(currentValue) => {
																							add_setting.new_filter_to_category = item.id;
																							if (!category.filters?.includes(item.data.name)) {
																								category.filters = category.filters ?? []
																								category.filters.push(item.data.name)
																								category.filters = [...category.filters]
																								toast.warning("Внимание!", {
																									description: `Не забудьте нажать кнопку Сохранить`,
																									action: { label: "Закрыть",	onClick: () => console.info("") },
																									position: 'top-right',
																								})
																							} else {
																								toast.warning("Ошибка!", {
																									description: `Данный фильтр уже добавлен`,
																									action: {
																										label: "Закрыть",	
																										onClick: () => console.info(""),
																									},
																									position: 'top-right',
																								})
																							}
																							closeAndFocusTrigger(ids.trigger);
																						}}
																					>
																						<Check class={cn( "mr-2 h-4 w-4",  !category.filters?.includes(item.data.name) && "text-transparent")}  />
																						{item.data.name}
																					</Command.Item>
																				{/each}
																			</Command.Group>
																		</Command.Root>
																	</ScrollArea>
																		
																</Popover.Content>
															</Popover.Root>
														</div>
													</Popover.Content>
												</Popover.Root>
											</div>
												
											<Separator class="my-2" />
										{/each}
									{:else}
										<p class="my-2 text-sm">Пока что фильтров нет. Добавьте новые фильтры ниже.</p>
										<Separator class="mb-2" />
									{/if}
										
									<div class="flex justify-between items-center mt-5 pb-2">
										<Dialog.Root>
											<Dialog.Trigger>
												<button class="flex items-center underline underline-offset-4 gap-2 text-red-600">Удалить <CrossCircled class="h-5 w-5 mt-1" /></button>
											</Dialog.Trigger>
											<Dialog.Content>
												<Dialog.Header>
													<Dialog.Title>Удалить всю группу фильтров?</Dialog.Title>
													<Dialog.Description>Вы уверены? Данное действие невозможно отменить.</Dialog.Description>
												</Dialog.Header>
													
												<Button class="w-full" on:click={() => {
													if (globalIndex !== -1) {
														edit_site_settings('filters', null, globalIndex)
														toast.success("Успешно!", {
															description: `Категория "${filter.category}" удалена`,
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
												}}>Удалить</Button>
											</Dialog.Content>
										</Dialog.Root>

										<Dialog.Close>
											<Button on:click={() => {
												if (globalIndex !== -1) {
													edit_site_settings('filters', edit_setting, null, globalIndex)
												} else {
													toast.warning("Ошибка!", {
														description: `Что-то пошло не так`,
														action: { label: "Закрыть",	onClick: () => console.info("") },
														position: 'top-right',
													})
												}
											}}>
												Сохранить
											</Button>
										</Dialog.Close>
									</div>
								</ScrollArea>

							</Dialog.Content>
						</Dialog.Root>

						<!-- Удалить категорию -->
						<Dialog.Root>
							<Dialog.Trigger class="!outline-none">
								<button class="flex items-center underline underline-offset-4 gap-2 text-red-600 mt-2 pl-3">
										Удалить <CrossCircled class="h-5 w-5 mt-1" />
								</button>
							</Dialog.Trigger>
							<Dialog.Content class="sm:max-w-[425px]">
								<Dialog.Header>
									<Dialog.Title>Вы уверены, что хотите удалить группу фильтров?</Dialog.Title>
									<Dialog.Description>Данное действие невозможно отменить.</Dialog.Description>
								</Dialog.Header>

								<Dialog.Close class="flex justify-between">
									<Button variant="secondary">Отмена</Button>

									<Button on:click={() => {
										if (globalIndex !== -1) {
											edit_site_settings('filters', null, globalIndex)
											toast.success("Успешно!", {
												description: `Категория "${filter.category}" удалена`,
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

		<!-- Добавить категорию блюда -->
		<Popover.Root>
			<Popover.Trigger asChild let:builder class="!outline-none">
				<Button builders={[builder]} variant="outline"><PlusCircled class="text-gray-400 h-4 w-4 mr-2"/> Добавить группу фильтров</Button>
			</Popover.Trigger>
			<Popover.Content class="w-max" align="start">
				<p class="font-bold mb-1">Выберите категорию блюда</p>
				<div class="flex items-center space-x-2">
					<Popover.Root bind:open={open.group_in_filters} let:ids>
						<Popover.Trigger asChild let:builder class="w-11/12 !outline-none">
							<Button
								builders={[builder]}
								variant="outline"
								role="combobox"
								class="w-60 font-normal justify-between"
							>
								{selectedGroup}
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
												add_setting.group_in_filters = currentValue;
												closeAndFocusTrigger(ids.trigger);
											}}
											>
												<Check class={cn( "mr-2 h-4 w-4",  add_setting.group_in_filters !== d && "text-transparent")}  />
												{d}
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.Root>
							</ScrollArea>
							
						</Popover.Content>
					</Popover.Root>
					<Button 
						disabled={!add_setting.group_in_filters || filters.some(filter => filter.category === add_setting.group_in_filters && filter.city === city)}
						on:click={() => {
							const existingIds = filters?.map(item => item.id) || [];
							const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
							edit_site_settings('filters', {
								id: maxId + 1, 
								category: add_setting.group_in_filters, 
								city
							})
							add_setting.group_in_filters = null
						}}>
						Сохранить
					</Button>
				</div>
				{#if filters.some(filter => filter.category === add_setting.group_in_filters && filter.city === city)}
					<p class="text-red-600 text-xs mt-2">Такая категория уже существует</p>
				{/if}
			</Popover.Content>
		</Popover.Root>
	</div>
</div>