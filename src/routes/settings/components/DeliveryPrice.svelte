<script lang="ts">
    // @ts-nocheck
    import { beforeUpdate } from "svelte";
    import {_store} from "../../../core/_store"
    import { utils } from "../../../core/utils"
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import CrossCircled from "svelte-radix/CrossCircled.svelte";
    import Loader from "$lib/components/ui/Loader.svelte";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog";
    import PlusCircled from "svelte-radix/PlusCircled.svelte";
    import { Label } from "$lib/components/ui/label/index.js";
    import Pencil2 from "svelte-radix/Pencil2.svelte";
    import MinusCircled from "svelte-radix/MinusCircled.svelte";

    export let edit_site_settings
    export let city_name = ''
    export let city = ''

    let products = []
    let delivery_price = []
    let edit_setting

    let min_sum;
    let price;
    let uuid;
    let zone;
    let days_close = []
    let new_day = ''

    beforeUpdate(()=>{
        Init_SetIems()
    })

    const Init_SetIems = () => {
        if ($_store.load_settings) {
            delivery_price = $_store.site_settings.find(s => s.id == 'delivery_price')?.data
        }
    }
</script>



<div class="w-full my-8">
    <p class="font-bold mb-2 scroll-mt-[70px]" id="delivery_price">Стоимость доставки {city_name}</p>
    <div class="grid grid-cols-3 gap-10">
        {#if delivery_price && delivery_price.length > 0}
        {@const delivery_price_city = delivery_price.filter(i => i.city == city) || []}
            {#each delivery_price_city as item}
            {@const globalIndex = delivery_price.findIndex(i => i.uuid === item.uuid && i.city == city)}
                <!-- Редактировать-->
                <Dialog.Root>
                    <div class="flex">
                        <Dialog.Trigger on:click={() => edit_setting = { ...item }} class="!outline-none">
                            <div class="flex items-start gap-3">
                                <div class="flex flex-col items-start">
                                    <p>Доставка: <span class="font-bold">{item.price} ₽</span> при сумме заказа от <span class="font-bold">{item.min_sum} ₽</span></p>
                                    <p>{item.uuid}</p>
                                    <p>Зона: {item.zone || '-'}</p>
                                    {#if item.days_close?.length > 0}
                                        <p class="max-w-[340px] text-start">Дни отмены: {item.days_close.join(', ')}</p>
                                    {/if}
                                </div>
                                <Pencil2 class="h-5 w-5" />
                            </div>
                        </Dialog.Trigger>
                    </div>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>Редактировать</Dialog.Title>
                        <div class="grid">
                            <div class="flex flex-col gap-2 mt-2">
                                <Label for="edit_min_sum">Минимальная сумма заказа</Label>
                                <Input bind:value={edit_setting.min_sum} id="edit_min_sum" type="number" on:input={(event) => edit_setting.min_sum = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')} />
                            </div>
                            <div class="mt-2 gap-2">
                                <Label for="edit_lat">Стоимость доставки</Label>
                                <Input bind:value={edit_setting.price} id="edit_lat" type="number" on:input={(event) => edit_setting.price = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')} />
                            </div>

                            <div class="flex flex-col gap-2 mt-2">
                                <Label for="edit_uuid">Uuid</Label>
                                <Input bind:value={edit_setting.uuid} id="edit_uuid" />
                            </div>

                            <div class="flex flex-col gap-2 mt-2">
                                <Label for="edit_zone">Зона</Label>
                                <Input bind:value={edit_setting.zone} id="edit_zone" />
                            </div>

                            <div class="flex flex-col gap-2 mt-2">
                                <Label>Дни отмены (не обязательно)</Label>
                                <div>
                                    <div class="flex w-full gap-2">
                                        <Input placeholder="дд-мм" bind:value={new_day} />
                                        <button on:click={() => {
                                            if (new_day.trim() !== '') {
                                                if (!edit_setting.days_close) edit_setting.days_close = []
                                                edit_setting.days_close.push(new_day.trim())
                                                new_day = ''
                                            }
                                        }}>
                                            <PlusCircled />
                                        </button>
                                    </div>

                                    {#if edit_setting.days_close?.length > 0}
                                        {#each edit_setting.days_close as day, index}
                                            <div class="flex gap-2 w-full mt-1">
                                                <p>{day}</p>
                                                <button 
                                                    class="text-red-600" 
                                                    on:click={() => edit_setting.days_close = edit_setting.days_close.filter((_, i) => i !== index)}
                                                >
                                                    <MinusCircled />
                                                </button>
                                            </div>
                                        {/each}
                                    {/if}
                                </div>
                            </div>
                            
                            
                            <div class="flex justify-between items-center mt-5">
                                <Dialog.Root>
                                    <Dialog.Trigger>
                                        <button 
                                            class="flex items-center underline underline-offset-4 gap-2 text-red-600" >
                                            Удалить <CrossCircled class="h-5 w-5 mt-1" />
                                        </button>
                                    </Dialog.Trigger>
                                    <Dialog.Content>
                                        <Dialog.Header>
                                              <Dialog.Title>Удалить</Dialog.Title>
                                            <Dialog.Description>Вы уверены? Данное действие невозможно отменить.</Dialog.Description>
                                        </Dialog.Header>
                                        <Button on:click={() => edit_site_settings('delivery_price', null, globalIndex)}>
                                            Удалить
                                        </Button>
                                    </Dialog.Content>
                                </Dialog.Root>
                                    
                                <Dialog.Close>
                                    <Button 
                                        disabled={!edit_setting.min_sum || !edit_setting.price || !edit_setting.uuid || new_day !== ''}
                                        on:click={() => edit_site_settings('delivery_price', edit_setting, null, globalIndex)}>
                                        Сохранить изменения
                                    </Button>
                                </Dialog.Close>
                            </div>
                        </div>
                      </Dialog.Header>
                    </Dialog.Content>
                </Dialog.Root>
            {/each}
        {/if}
    </div>
    
    <!-- Добавить -->
    <Popover.Root>
        <Popover.Trigger asChild let:builder class="!outline-none">
            <Button builders={[builder]} variant="outline" class="mt-3"><PlusCircled class="text-gray-400 h-4 w-4 mr-2" /> Добавить</Button>
        </Popover.Trigger>
        <Popover.Content class="w-max" align="start">
            <p class="font-bold mb-3">Добавить</p>
            <div>
                <div class="flex justify-between gap-5">
                    <div class="flex flex-col gap-2">
                        <p >Минимальная сумма заказа:</p>
                        <Input 
                            bind:value={min_sum}  class="w-full" type='number'
                            on:input={(event) => min_sum = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')}  />
                    </div>
    
                    <div class="flex flex-col gap-2">
                        <p>Цена доставки:</p>
                        <Input 
                            bind:value={price} class="w-full" type='number'
                            on:input={(event) => price = event.target.value.replace(/[^A-Za-z0-9_-]/g, '')}  />
                    </div>
                </div>
                

                <div class="w-full my-5 flex flex-col gap-2">
                    <p>Uuid:</p>
                    <Input 
                        bind:value={uuid} class="w-full"/>
                </div>

                <div class="w-full my-5 flex flex-col gap-2">
                    <p>Зона:</p>
                    <Input 
                        bind:value={zone} class="w-full"/>
                </div>

                <div class="flex flex-col gap-2">
                    <Label>Дни отмены (не обязательно)</Label>
                    <div>
                        <div class="flex w-full gap-2">
                            <Input placeholder="дд-мм" bind:value={new_day} />
                            <button on:click={() => {
                                if (new_day.trim() !== '') {
                                    days_close.push(new_day.trim())
                                    new_day = ''
                                }
                            }}>
                                <PlusCircled />
                            </button>
                        </div>

                        {#if days_close?.length > 0}
                            {#each days_close as day, index}
                                <div class="flex gap-2 w-full mt-1">
                                    <p>{day}</p>
                                    <button 
                                        class="text-red-600" 
                                        on:click={() => days_close = days_close.filter((_, i) => i !== index)}
                                    >
                                        <MinusCircled />
                                    </button>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>

                <Button 
                    disabled={!min_sum || !price || !uuid}
                    on:click={() => {edit_site_settings('delivery_price', {min_sum, price, uuid, zone, city, days_close}); days_close = []}}>
                    Сохранить
                </Button>
            </div>
        </Popover.Content>
    </Popover.Root>
</div>