<script>
	//@ts-nocheck
	import { page } from '$app/stores';
	import { Button } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { resetMode, setMode } from "mode-watcher";
    import { _store } from '../core/_store';
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Command from "$lib/components/ui/command/index.js";
	import { cn } from "$lib/utils.js";
	import { tick } from "svelte";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Accordion from "$lib/components/ui/accordion";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Moon, Sun, Check, Pencil, X, ChevronsUpDown } from "@lucide/svelte";
    import { _auth, _city, _site_settings } from '$lib/store.svelte';

	let open_city = $state('')
    let cities = $state('')

	const Exit = (m)=>{
        localStorage.removeItem('token')
        _auth.is_authenticated = false
        _auth.user = {}
    }

	const get_name = ()=>{
		let name = _auth.user.first_name ? _auth.user.first_name : _auth.user.username
		return name ? name.toUpperCase().substring(0, 2) : '?'
	}

	onMount(()=>{
		let interval;
		if (_site_settings.length === 0) {
			interval = setInterval(() => {
				if (_site_settings.length > 0) {
					clearInterval(interval);
					cities = _site_settings.list.find(s => s.id == 'city')?.data
				}
			},1000)
		} else {
			cities = _site_settings.list.find(s => s.id == 'city')?.data
		}
	})
</script>

<header class="w-full top-0 flex py-2 items-center justify-between gap-4 border-b bg-background px-4 fixed bg-white dark:bg-stone-950 z-10">
    <nav class="fgap-6 font-medium flex flex-row items-center gap-5 text-sm lg:gap-6">
		<a href="/" class:!text-foreground={$page.url.pathname === '/' ? 'page' : undefined} class="text-muted-foreground transition-colors hover:text-foreground">
			Главная
		</a>
		<a href="/settings" class:!text-foreground={$page.url.pathname === '/settings' ? 'page' : undefined} class="text-muted-foreground transition-colors hover:text-foreground">
			Доп. настройки
		</a>
		<a href="/iiko" class:!text-foreground={$page.url.pathname === '/iiko' ? 'page' : undefined} class="text-muted-foreground transition-colors hover:text-foreground">
			IIKO
		</a>
    </nav>
	<div class="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4"></div>
    <div class="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
		<Popover.Root bind:open={open_city}>
			<Popover.Trigger asChild class="w-60">
				<Button
					variant="outline"
					role="combobox"
                    aria-expanded={open_city}
					class="w-40 font-normal justify-between"
				>
					{((cities && Array.isArray(cities)) ? cities.find(c => c.id === _city)?.name : null) ?? 'Город'}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</Popover.Trigger>
			<Popover.Content class="p-0 w-40">
				<Command.Root>
					<Command.Group>
						{#each cities as c}
							<Command.Item
								value={c.id}
								onSelect={() => {
                                    localStorage.setItem('city', c.id)
									setTimeout(() => location.reload(), 100); 
								}}>
								<Check class={cn( "mr-2 h-4 w-4",  city !== c.id && "text-transparent")}  />
								{c.name}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>

		<Dialog.Root>
			<Dialog.Trigger><div><Button variant="outline">Помощь</Button></div></Dialog.Trigger>
			<Dialog.Content class="max-w-[80%]">
				<Dialog.Header><Dialog.Title>Инструкция по использованию</Dialog.Title></Dialog.Header>
				<ScrollArea class="h-[80vh]">					
					<Accordion.Root>
						<!-- Как формируется база данных товаров -->
						<Accordion.Item value="item-1">
						  <Accordion.Trigger>Как формируется база данных товаров</Accordion.Trigger>
						  <Accordion.Content>
							База данных товаров формируется на основе базы данных Tillypad (ТП). Товары объединяются в группы по названию. Например, Пицца Мясная (большая, средняя, маленькая) объединяются в один товар — Пицца Мясная.
							<br><br>
							Обновления полей "Цена", "Вес", "Доступность в ТП" отображаются в базе данных сразу. 
							<br><br>
							При добавлении новых товаров в ТП они попадают в секцию "Есть новые товары!" в верхнем правом углу на главной странице. В этой секции доступны фильтры по группе и названию товара, а также отображаются товары, входящие в эту группу.
							<br>
							Если группа товаров уже существует, рядом появляется кнопка "Обновить", которая добавляет новые товары в существующую группу. Если же группа товаров еще не существует, она будет добавлена с новыми товарами при клике на кнопку "Добавить в бд".
						  </Accordion.Content>
						</Accordion.Item>
					  
						<!-- Работа с товарами -->
						<Accordion.Item value="item-2">
						  <Accordion.Trigger>Работа с товарами</Accordion.Trigger>
						  <Accordion.Content>
							На главной странице отображается список товаров СушиПицца74. Доступна фильтрация товаров по названию, категории и составу. 
					  
							Для редактирования товара нажмите на иконку <Pencil class="w-4 h-4 mx-1 inline" /> в правом столбце таблицы товаров.
					  
							<p class="font-bold mt-2">Описание полей:</p>
							<ul class="list-disc ml-5 mt-1 mb-5">
								<li><strong>Название</strong> — отображается в карточке товара на сайте.</li>
								<li><strong>Описание</strong> — отображается в карточке товара на сайте.</li>
								<li><strong>SEO-заголовок</strong> — описание товара для SEO-оптимизации.</li>
								<li><strong>Meta описание</strong> — используется для поисковой выдачи.</li>
								<li><strong>Метки</strong> — отображаются на карточке товара сверху изображения (например, метки "new", "hot"). Для добавления новой метки перейдите в раздел "Доп. настройки".</li>
								<li>
									<strong>Модификаторы</strong> — используются только для пицц, например, для выбора теста и соуса. 
									Отображается в карточке товара в виде табов:
									<img src="img/tabs.png" alt="Скриншот табов в карточке товара" class="h-[70px]">
									Если в товар добавлен модификатор 'тесто', у карточки товара появится таб с выбором теста (традиционное \ тонкое). 
									Если в товар добавленимодификатор 'соус', у карточки товарапоявится таб с выбором соуса (томатный \ белый).
								</li>
								<li><strong>Категория ролла</strong> — используется для разделения роллов на категории. Для добавления новой категории перейдите в раздел "Доп. настройки".</li>
								<li><strong>Количество роллов</strong> — для наборов роллов, показывает количество штук, входящих в набор.</li>
								<li><strong>Состав</strong> — отображает компоненты товара для фильтрации на сайте. Для наборов роллов компонентами являются готовые роллы. Если компонента отсутствует в списке, её необходимо добавить на главной странице.</li>
								<li><strong>Изображение</strong> — картинка товара. Можно добавить несколько изображений и удалить их при необходимости, нажав на иконку <X class="text-red-600 w-4 h-4 inline" />.</li>
							</ul>
					  
							<p>Ниже редактируемых полей находятся товары, входящие в данную группу. Чтобы перенести товар в другую группу, нажмите "Перенести" и выберите нужную группу.</p>
					  
							<p class="mt-2"><span class="font-bold">Внимание!</span> Не забудьте нажать "Сохранить" после внесения изменений.</p>
						  </Accordion.Content>
						</Accordion.Item>
					  
						<!-- Как добавить новый товар? Как удалить товар? -->
						<Accordion.Item value="item-3">
						  <Accordion.Trigger>Как добавить новый товар? Как удалить товар?</Accordion.Trigger>
						  <Accordion.Content>
							Новый товар можно добавить только после его добавления в ТП. Если товар есть в ТП, он появится в секции "Есть новые товары!", после чего его необходимо добавить в базу данных вручную.
					  
							Удаление товаров из базы данных не предусмотрено, даже если товар был удалён из ТП.
						  </Accordion.Content>
						</Accordion.Item>
					  
						<!-- Как перенести товар из одной группы в другую? -->
						<Accordion.Item value="item-4">
						  <Accordion.Trigger>Как перенести товар из одной группы в другую?</Accordion.Trigger>
						  <Accordion.Content>
							При добавлении нового товара из ТП может некорректно определиться категория или название товара. В таком случае нужно создать новую группу товара и перенести товары в нужную группу.
					  
							После добавления новой группы товара, найдите её в списке товаров, нажмите на иконку <Pencil class="w-4 h-4 mx-1 inline" />, затем нажмите кнопку "Перенести" в нижней части окна и выберите нужную группу.
						  </Accordion.Content>
						</Accordion.Item>
					  
						<!-- Добавление новых компонентов -->
						<Accordion.Item value="item-5">
						  <Accordion.Trigger>Добавление новых компонентов</Accordion.Trigger>
						  <Accordion.Content>
							В верхней левой части главной страницы найдите секцию "Добавить продукты в состав". 
					  
							Выберите группу товара и введите название нового компонента. Если выбрана группа "Наборы", вместо ввода названия компонента отобразится список роллов, существующих в базе данных.
					  
							<br><br>Без добавления компонента он не появится в выпадающем списке при редактировании товара.
						  </Accordion.Content>
						</Accordion.Item>
					  
						<!-- Отправка изменений на сайт -->
						<Accordion.Item value="item-6">
						  <Accordion.Trigger>Отправка изменений на сайт</Accordion.Trigger>
						  <Accordion.Content>
							Чтобы опубликовать изменения на сайте, нажмите кнопку "Запланировать обновление". Без этого изменения останутся только на сервисе, но не будут опубликованы на сайте.
						  </Accordion.Content>
						</Accordion.Item>

						<!-- Дополнительные настройки -->
						<Accordion.Item value="item-7">
							<Accordion.Trigger>Работа с Доп. настройками</Accordion.Trigger>
							<Accordion.Content>
								Разделы дополнительных настроек:
								<ul class="list-disc ml-5 mt-1 mb-5">
									<li>Метки</li>
									<li>Модификаторы</li>
									<li>Размеры блюд</li>
									<li>Фильтры</li>
									<li>Категории роллов</li>
									<li>Дополнительные товары</li>
									<li>Картинки для слайдера</li>
									<li>Информация о доставке</li>
									<li>Акции и новости</li>
									<li>Блок "Внимание" для акций</li>
								</ul>

								<p class="font-bold mt-5 mb-2">Метки</p>
								Хранилище меток для товара. Для добавления необходимо заполнить название метки и добавить изображение метки (предпочтительно в формате svg).

								<p class="font-bold mt-5 mb-2">Модификаторы</p>
								Используются только для пицц. Отображается в карточке товара в виде табов:
								<img src="img/tabs.png" alt="Скриншот табов в карточке товара 1" class="h-[70px]">
								Если в товар добавлен модификатор 'тесто', у карточки товара появится таб с выбором теста (традиционное \ тонкое). <br>
								Если в товар добавленимодификатор 'соус', у карточки товарапоявится таб с выбором соуса (томатный \ белый). <br>
								На данный момент добавление нового модификатора в доп. настройках не приведет к изменению на сайте.

								<p class="font-bold mt-5 mb-2">Размеры блюд</p>
								Хранилище размеров блюд для разных категорий товаров. Название категории в "Размерах блюд" должно совпадать с названием категории товара.
								Размеры товаров используются в табах к карточке товара на сайте, примеры:
								<ul class="list-disc ml-5 mt-1 mb-5">
									<li>
										Пицца
										<img src="img/tabs_pizza.png" alt="Скриншот табов пицца" class="h-[40px]">
									</li>
									<li>
										Роллы и наборы
										<img src="img/tabs_rolly.png" alt="Скриншот табов роллы" class="h-[40px]">
									</li><li>
										Закуски
										<img src="img/tabs_snaks.png" alt="Скриншот табов наборы" class="h-[40px]">
									</li>
								</ul>

								В дальнейшем выбранный размер ролла добавляется к товару в корзине.

								<p class="font-bold mt-5 mb-2">Фильтры</p>
								<p class="mt-3"><strong>Создание/редактирование фильтров</strong></p>
								<p class="mt-3">
									<strong>Задача:</strong> Создать группу фильтров, с помощью которой пользователи смогут отфильтровывать товары категории "Пицца" без ингредиентов "помидоры", "шампиньоны", "опята", "маслины".<br /><br />
									1. Выбираем из выпадающего списка категорию блюда, для которой необходимо добавить фильтры, и нажимаем кнопку "Сохранить". В нашем случае это категория "Пицца".<br />
									<img src="img/filtr-1.png" alt="Пример1" class="h-[100px]">
									2. Нажимаем кнопку редактирования.<br/>
									<img src="img/filtr-2.png" alt="Пример2" class="h-[40px]">
									3. Создаем группу фильтров: вводим название группы и добавляем 1 или несколько фильтров из предложенного списка. Нажимаем кнопку "Добавить группу фильтров".<br />
									<img src="img/filtr-3.png" alt="Пример3" class="h-[150px]"><br/>
									4. Добавленная группа фильтров отобразилась в разделе "Существующие фильтры". Здесь можно добавить новый фильтр (например, "ветчина"), а также удалить существующий фильтр или всю группу фильтров.<br />
									<img src="img/filtr-4.png" alt="Пример4" class="h-[135px]"><br/>
									<strong>Важно!</strong>При изменениях в разделе "Существующие фильтры" необходимо нажать на кнопку "Сохранить", иначе изменения не сохранятся.<br />
									<img src="img/filtr-5.png" alt="Пример5" class="h-[60px]">
									<strong>Удаление фильтров</strong><br />
									Удаление фильтров для категории товара осуществляется в окне редактирования при нажатии на кнопку "Удалить".<br />
									<img src="img/filtr-6.png" alt="Пример6" class="h-[50px]">
								</p>

								<p class="font-bold mt-5 mb-2">Категории роллов</p>
								Хранилище категорий роллов. Название на латинице используется для ссылок в навигации по роллам на сайте.

								<p class="font-bold mt-5 mb-2">Дополнительные товары и товары к роллам</p>
								Хранилища товаров, которые предлагаются дополнительно в корзине. Товары к роллам могут добавляться в корзину бесплатно в зависимости от количества роллов в корзине.

								<p class="font-bold mt-5 mb-2">Картинки для слайдера</p>
								Хранилище картинок, которые используются в слайдере на главной странице.

								<p class="font-bold mt-5 mb-2">Информация о доставке</p>
								Хранилище блоков текста, который используется на странице "Доставка". Каждая строчка текста добавляется отдельно в блоке "Основная информация".
							
								<p class="font-bold mt-5 mb-2">Акции и новости</p>
								<p class="mt-3">Для добавления нового блока выберите город, где он будет отображаться, укажите тип блока (акции или новости), добавьте заголовок и текст блока.</p>
								<p class="mt-3"><strong>Создание и редактирование текста акций и новостей:</strong><br />
										<br/>Пример текста акций:<br />
										1.<img src="img/primer-1.png" alt="Скриншот текста акции" class="h-[100px] ml-2">
										2.<img src="img/primer-2.png" alt="Скриншот текста акции" class="h-[150px] ml-2">
										<br />
									Основные HTML-теги и их назначение<br /><br />
									1. Тег <strong>&lt;br/&gt; </strong><br />
									- Что делает? Создает перенос строки (как нажатие Enter в тексте).<br />
									- Когда использовать? Если нужно разделить текст на абзацы или добавить пустую строку для лучшей читаемости.<br />
									- Пример из акции 1: <strong>&lt;br/&gt &lt;br/&gt</strong> — создает две пустые строки между предложениями, чтобы отделить описание подарка от условий акции.<br />
									- Как использовать? Просто вставьте <strong> &lt;br/&gt; </strong>там, где нужен перенос строки. Не требует закрывающего тега.<br /><br />
									2. Тег <strong>&lt;a&gt</strong><br />
									- Что делает? Создает гиперссылку, по которой можно перейти на другую страницу или сайт.<br />
									- Когда использовать? Когда нужно вставить кликабельную ссылку, например, на страницу ВКонтакте.<br />
									- Пример из акции 2: <strong>&lt;a href='https://vk.com/topic-61333822_52007185?offset=last' style='font-weight: bold; &gt vk.com/sushipizza74 &lt;/a&gt</strong> — создает ссылку на раздел отзывов ВКонтакте, где текст <em><strong>vk.com/sushipizza74</strong></em> кликабелен.<br />
									- Как использовать?<br />
										  - В атрибуте <em><strong>href</strong></em> укажите полный URL-адрес (например, <em>https://vk.com/...</em>).<br />
										  - Между <strong>&lt;a&gt</strong> и <strong>&lt;/a&gt </strong> напишите текст, который будет отображаться как ссылка.<br /><br />
									3. Атрибут <strong>style</strong><br />
									- Что делает? Добавляет стили (оформление) к элементу, например, делает текст жирным или меняет его цвет.<br />
									- Когда использовать? Если нужно выделить текст (например, сделать его жирным, изменить цвет или размер шрифта).<br />
									- Пример из акции: <strong>style='font-weight: bold;' </strong>— делает текст жирным.<br />
									- Как использовать? Внутри тега (например, &lt;a&gt или &lt;span&gt ) добавьте <em><strong>style='название-стиля: значение;'</strong></em>. Например:<br />
										  - <em>font-weight: bold;</em> — делает текст жирным.<br />
										  - <em>color: red;</em> — делает текст красным.<br />
										  - Стили разделяйте точкой с запятой, если их несколько: <em>style='font-weight: bold; color: blue;'</em>.<br /><br />
									4. Тег <strong>&lt;span&gt</strong> <br />
									- Что делает? Выделяет часть текста для применения стилей, но не меняет структуру страницы (в отличие от абзацев или заголовков).<br />
									- Когда использовать? Когда нужно оформить небольшой кусок текста, например, сделать его жирным или цветным, без переноса строки.<br />
									- Пример из акции: <strong>&lt;span style='font-weight: bold;'&gt@sushipizza74 &lt;/span&gt</strong>  — делает текст <strong>@sushipizza74</strong> жирным.<br />
									- Как использовать? Поместите текст между  <strong>&lt;span&gt</strong>  и  <strong>&lt;/span&gt</strong> , добавьте атрибут <em>style</em>, если нужно оформление. Например: код  <strong>&lt;span style='color: red;'&gt Привет&lt;/span&gt</strong> сделает текст красным  —  <span style='color: red;'>Привет</span>.<br /><br />
									Как создавать текст акции<br />
									1. Начните с текста акции. Напишите основной текст, описывающий условия акции, например: «При заказе от 1000 руб. дарим подарок!».<br />
									2. Добавьте переносы строк. Если нужно разделить текст на части, вставьте <strong>&lt;br/&gt;</strong> между предложениями.<br />
									3. Вставьте ссылки. Если в акции есть ссылка (например, на соцсети), используйте тег <strong>&lt;a&gt</strong> с атрибутом <strong>href</strong>. Убедитесь, что адрес правильный и начинается с <em>https://</em>.<br />
									4. Выделите важные слова. Используйте <strong>&lt;span /&gt</strong>  с атрибутом <strong>style='font-weight: bold;'</strong> для выделения текста, который должен привлекать внимание (например, название страницы или отметку).<br />
									5. Проверьте текст. Убедитесь, что все теги закрыты (например, &lt;a&gt закрывается &lt;/a&gt, &lt;span&gt — &lt;/span&gt), а ссылки ведут на правильные страницы.<br /><br />
								</p>

								<p class="font-bold mt-5 mb-2">Блок "Внимание" для акций</p>
								Хранилище строк текста, используются на странице Акции. Каждая строка текста отображается со знаком 
								<img src="img/attention.svg" alt="attention icon 1" class="w-[18px] h-[18px] inline" />
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</ScrollArea>
			</Dialog.Content>
		</Dialog.Root>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
                <div>
				<Button variant="link" size="icon">
					<Avatar.Root>
						<Avatar.Image src={_auth.user.photo_url} alt={get_name()} />
						<Avatar.Fallback>{get_name()}</Avatar.Fallback>
					</Avatar.Root>
				</Button>
                </div>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
			<DropdownMenu.Item onclick={() => Exit()}>Выход</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
    </div>
</header>
