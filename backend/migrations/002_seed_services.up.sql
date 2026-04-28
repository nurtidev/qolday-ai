-- Additional seed services covering all categories and organizations shown in the UI

-- 1. Демеу — Льготное финансирование МСБ (Финансирование)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Льготное финансирование субъектов МСБ',
  'Кредитование малого и среднего бизнеса по льготной ставке 6% годовых через программу «Демеу». Сумма займа — до 750 млн тенге, срок — до 7 лет.',
  'Финансирование',
  'Демеу',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Информация о заявителе",
        "fields": [
          {"id":"f1","type":"text","label":"ИИН / БИН","required":true,"prefill_from":"egov.iin"},
          {"id":"f2","type":"text","label":"Наименование организации","required":true,"prefill_from":"egov.org_name"},
          {"id":"f3","type":"select","label":"Отрасль деятельности","required":true,"options":["Производство","Торговля","Услуги","Строительство","Сельское хозяйство","IT и технологии"]},
          {"id":"f4","type":"number","label":"Среднегодовая выручка (тенге)","required":true},
          {"id":"f5","type":"number","label":"Количество сотрудников","required":true}
        ]
      },
      {
        "id": "step_2",
        "title": "Параметры займа",
        "fields": [
          {"id":"f6","type":"number","label":"Запрашиваемая сумма (тенге)","required":true},
          {"id":"f7","type":"select","label":"Срок займа","required":true,"options":["12 месяцев","24 месяца","36 месяцев","48 месяцев","60 месяцев","84 месяца"]},
          {"id":"f8","type":"textarea","label":"Цель кредита","required":true,"placeholder":"Опишите на что будут направлены средства"},
          {"id":"f9","type":"calculated","label":"Ежемесячный платёж (оценочно)","formula":"f6 * 0.06 / 12","readonly":true}
        ]
      },
      {
        "id": "step_3",
        "title": "Документы",
        "fields": [
          {"id":"f10","type":"file","label":"Финансовая отчётность за последние 2 года","accept":".pdf","required":true},
          {"id":"f11","type":"file","label":"Бизнес-план / технико-экономическое обоснование","accept":".pdf","required":true},
          {"id":"f12","type":"file","label":"Свидетельство о государственной регистрации","accept":".pdf","required":true}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 2. KazGuarantee — Гарантия по банковскому кредиту (Гарантии)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Государственная гарантия по банковским кредитам',
  'KazGuarantee предоставляет гарантии субъектам МСБ в размере до 85% от суммы кредита, что снижает требования банков к залоговому обеспечению.',
  'Гарантии',
  'KazGuarantee',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Данные о предприятии",
        "fields": [
          {"id":"g1","type":"text","label":"БИН организации","required":true,"prefill_from":"egov.iin"},
          {"id":"g2","type":"text","label":"Наименование","required":true,"prefill_from":"egov.org_name"},
          {"id":"g3","type":"select","label":"Форма собственности","required":true,"options":["ТОО","АО","ИП","Крестьянское хозяйство"]},
          {"id":"g4","type":"number","label":"Сумма кредита в банке (тенге)","required":true},
          {"id":"g5","type":"calculated","label":"Максимальная сумма гарантии (85%)","formula":"g4 * 0.85","readonly":true}
        ]
      },
      {
        "id": "step_2",
        "title": "Банк и цель",
        "fields": [
          {"id":"g6","type":"select","label":"Банк-партнёр","required":true,"options":["Halyk Bank","Kaspi Bank","Jusan Bank","ForteBank","Bereke Bank","ЦентрКредит Банк"]},
          {"id":"g7","type":"textarea","label":"Цель получения кредита","required":true},
          {"id":"g8","type":"file","label":"Кредитный договор или предварительное одобрение банка","accept":".pdf","required":true}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 3. KazExport — Страхование экспортных контрактов (Экспорт)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Страхование экспортных контрактов',
  'KazExport страхует риски неоплаты по экспортным сделкам казахстанских компаний. Покрытие — до 90% суммы контракта. Доступно для несырьевых товаров и услуг.',
  'Экспорт',
  'KazExport',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Экспортёр",
        "fields": [
          {"id":"e1","type":"text","label":"БИН экспортёра","required":true,"prefill_from":"egov.iin"},
          {"id":"e2","type":"text","label":"Наименование компании","required":true,"prefill_from":"egov.org_name"},
          {"id":"e3","type":"select","label":"Вид экспортируемой продукции","required":true,"options":["Продукты питания","Металлы и изделия","Химическая продукция","Текстиль","Машины и оборудование","Программное обеспечение","Услуги"]},
          {"id":"e4","type":"number","label":"Экспортная выручка за прошлый год (USD)","required":true}
        ]
      },
      {
        "id": "step_2",
        "title": "Параметры контракта",
        "fields": [
          {"id":"e5","type":"text","label":"Страна-импортёр","required":true},
          {"id":"e6","type":"text","label":"Наименование иностранного покупателя","required":true},
          {"id":"e7","type":"number","label":"Сумма контракта (USD)","required":true},
          {"id":"e8","type":"select","label":"Срок отсрочки платежа","required":true,"options":["До 30 дней","30–90 дней","90–180 дней","Свыше 180 дней"]},
          {"id":"e9","type":"calculated","label":"Страховое покрытие (90%)","formula":"e7 * 0.9","readonly":true}
        ]
      },
      {
        "id": "step_3",
        "title": "Документы",
        "fields": [
          {"id":"e10","type":"file","label":"Экспортный контракт","accept":".pdf","required":true},
          {"id":"e11","type":"file","label":"Финансовая отчётность за 2 года","accept":".pdf","required":true}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 4. KazExport — Финансирование экспортных операций (Экспорт)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Финансирование предэкспортное и постэкспортное',
  'Предэкспортное финансирование для пополнения оборотного капитала под заключённый экспортный контракт. Ставка от 5% годовых в тенге, срок — до 3 лет.',
  'Экспорт',
  'KazExport',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Компания-экспортёр",
        "fields": [
          {"id":"pe1","type":"text","label":"БИН","required":true,"prefill_from":"egov.iin"},
          {"id":"pe2","type":"text","label":"Наименование","required":true,"prefill_from":"egov.org_name"},
          {"id":"pe3","type":"select","label":"Вид финансирования","required":true,"options":["Предэкспортное","Постэкспортное (факторинг)"]},
          {"id":"pe4","type":"number","label":"Сумма финансирования (тенге)","required":true},
          {"id":"pe5","type":"select","label":"Срок","required":true,"options":["6 месяцев","12 месяцев","24 месяца","36 месяцев"]}
        ]
      },
      {
        "id": "step_2",
        "title": "Контракт",
        "fields": [
          {"id":"pe6","type":"text","label":"Страна покупателя","required":true},
          {"id":"pe7","type":"number","label":"Сумма экспортного контракта (USD)","required":true},
          {"id":"pe8","type":"file","label":"Экспортный контракт","accept":".pdf","required":true},
          {"id":"pe9","type":"file","label":"Инвойсы / отгрузочные документы","accept":".pdf","required":false}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 5. АгроКапитал — Льготные кредиты для аграриев (Агросектор)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Льготное кредитование сельхозпроизводителей',
  'АгроКапитал выдаёт займы фермерам и сельхозпредприятиям по ставке 4% годовых на пополнение оборотного капитала, приобретение семян, удобрений и ГСМ.',
  'Агросектор',
  'АгроКапитал',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Сельхозпроизводитель",
        "fields": [
          {"id":"a1","type":"text","label":"ИИН / БИН","required":true,"prefill_from":"egov.iin"},
          {"id":"a2","type":"text","label":"Наименование / ФИО","required":true,"prefill_from":"egov.org_name"},
          {"id":"a3","type":"select","label":"Вид деятельности","required":true,"options":["Растениеводство","Животноводство","Птицеводство","Рыбоводство","Садоводство","Тепличное хозяйство"]},
          {"id":"a4","type":"number","label":"Площадь земли (га)","required":false},
          {"id":"a5","type":"select","label":"Регион","required":true,"options":["Акмолинская","Костанайская","Северо-Казахстанская","Павлодарская","Восточно-Казахстанская","Алматинская","Жамбылская","Туркестанская","Другой"]}
        ]
      },
      {
        "id": "step_2",
        "title": "Параметры займа",
        "fields": [
          {"id":"a6","type":"select","label":"Цель займа","required":true,"options":["Семена и посадочный материал","Удобрения и СЗР","ГСМ","Ветеринарные препараты","Корма","Пополнение оборотного капитала"]},
          {"id":"a7","type":"number","label":"Запрашиваемая сумма (тенге)","required":true},
          {"id":"a8","type":"select","label":"Срок займа","required":true,"options":["6 месяцев","12 месяцев","18 месяцев","24 месяца"]},
          {"id":"a9","type":"calculated","label":"Сумма процентов за год (4%)","formula":"a7 * 0.04","readonly":true}
        ]
      },
      {
        "id": "step_3",
        "title": "Документы",
        "fields": [
          {"id":"a10","type":"file","label":"Акт на право пользования землёй / договор аренды","accept":".pdf","required":false},
          {"id":"a11","type":"file","label":"Справка о наличии скота / посевных площадей","accept":".pdf","required":false},
          {"id":"a12","type":"file","label":"Финансовая отчётность или декларация","accept":".pdf","required":true}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 6. АгроКапитал — Лизинг сельскохозяйственной техники (Лизинг)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Лизинг сельскохозяйственной техники и оборудования',
  'Приобретение тракторов, комбайнов, посевных комплексов и другой сельхозтехники в лизинг по льготной ставке. Авансовый взнос — от 10%. Срок лизинга — до 7 лет.',
  'Лизинг',
  'АгроКапитал',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Заявитель",
        "fields": [
          {"id":"al1","type":"text","label":"ИИН / БИН","required":true,"prefill_from":"egov.iin"},
          {"id":"al2","type":"text","label":"Наименование / ФИО","required":true,"prefill_from":"egov.org_name"},
          {"id":"al3","type":"select","label":"Предмет лизинга","required":true,"options":["Трактор","Комбайн зерноуборочный","Посевной комплекс","Опрыскиватель","Кормоуборочный комбайн","Ирригационное оборудование","Другая техника"]}
        ]
      },
      {
        "id": "step_2",
        "title": "Параметры сделки",
        "fields": [
          {"id":"al4","type":"number","label":"Количество единиц техники","required":true},
          {"id":"al5","type":"number","label":"Стоимость единицы (тенге)","required":true},
          {"id":"al6","type":"calculated","label":"Общая стоимость","formula":"al4 * al5","readonly":true},
          {"id":"al7","type":"number","label":"Авансовый взнос (%)","required":true},
          {"id":"al8","type":"calculated","label":"Сумма аванса","formula":"al6 * al7 / 100","readonly":true},
          {"id":"al9","type":"calculated","label":"Сумма лизинга","formula":"al6 - al8","readonly":true},
          {"id":"al10","type":"select","label":"Срок лизинга","required":true,"options":["24 месяца","36 месяцев","48 месяцев","60 месяцев","84 месяца"]}
        ]
      },
      {
        "id": "step_3",
        "title": "Документы",
        "fields": [
          {"id":"al11","type":"file","label":"Коммерческое предложение от поставщика техники","accept":".pdf","required":true},
          {"id":"al12","type":"file","label":"Финансовая отчётность","accept":".pdf","required":true}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 7. ИнноФонд — Грант для технологических стартапов (Гранты)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Грант для инновационных стартапов (Seed)',
  'Безвозмездный грант ИнноФонда до 50 млн тенге для ранних технологических стартапов на разработку MVP, патентование и выход на рынок. Без доли в компании.',
  'Гранты',
  'ИнноФонд',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "О стартапе",
        "fields": [
          {"id":"i1","type":"text","label":"Название проекта","required":true},
          {"id":"i2","type":"text","label":"БИН организации (если есть)","required":false,"prefill_from":"egov.iin"},
          {"id":"i3","type":"select","label":"Стадия проекта","required":true,"options":["Идея","Прототип","MVP","Ранние продажи"]},
          {"id":"i4","type":"select","label":"Технологическое направление","required":true,"options":["FinTech","AgriTech","HealthTech","EdTech","GreenTech","Промышленный IoT","AI/ML","Другое"]},
          {"id":"i5","type":"textarea","label":"Краткое описание проблемы и решения","required":true,"placeholder":"Опишите проблему, которую решает ваш продукт, и как именно"}
        ]
      },
      {
        "id": "step_2",
        "title": "Команда и рынок",
        "fields": [
          {"id":"i6","type":"number","label":"Количество основателей","required":true},
          {"id":"i7","type":"textarea","label":"Ключевые компетенции команды","required":true},
          {"id":"i8","type":"number","label":"Объём целевого рынка (млн тенге)","required":false},
          {"id":"i9","type":"number","label":"Запрашиваемая сумма гранта (тенге)","required":true},
          {"id":"i10","type":"textarea","label":"На что будет потрачен грант","required":true}
        ]
      },
      {
        "id": "step_3",
        "title": "Документы",
        "fields": [
          {"id":"i11","type":"file","label":"Pitch deck (презентация проекта)","accept":".pdf","required":true},
          {"id":"i12","type":"file","label":"Финансовая модель","accept":".pdf,.xlsx","required":true},
          {"id":"i13","type":"file","label":"CV основателей","accept":".pdf","required":true}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 8. ИнноФонд — Субсидирование R&D расходов (Субсидии)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Субсидирование расходов на исследования и разработки',
  'ИнноФонд возмещает до 50% фактически понесённых затрат компаний на НИОКР, включая зарплату R&D-команды, закупку оборудования и патентование.',
  'Субсидии',
  'ИнноФонд',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Организация",
        "fields": [
          {"id":"rd1","type":"text","label":"БИН","required":true,"prefill_from":"egov.iin"},
          {"id":"rd2","type":"text","label":"Наименование","required":true,"prefill_from":"egov.org_name"},
          {"id":"rd3","type":"select","label":"Тип организации","required":true,"options":["Коммерческая компания","НИИ","Университет","Совместное предприятие"]},
          {"id":"rd4","type":"textarea","label":"Описание R&D-проекта","required":true}
        ]
      },
      {
        "id": "step_2",
        "title": "Расходы",
        "fields": [
          {"id":"rd5","type":"number","label":"Фактические R&D-расходы за период (тенге)","required":true},
          {"id":"rd6","type":"calculated","label":"Максимальная сумма субсидии (50%)","formula":"rd5 * 0.5","readonly":true},
          {"id":"rd7","type":"select","label":"Вид расходов","required":true,"options":["Зарплата R&D-команды","Оборудование и ПО","Патентование","Испытания и сертификация","Смешанные"]},
          {"id":"rd8","type":"file","label":"Первичные документы (счета, акты, зарплатные ведомости)","accept":".pdf","required":true},
          {"id":"rd9","type":"file","label":"Отчёт о выполненных R&D-работах","accept":".pdf","required":true}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 9. Astana Cap. — Привлечение прямых иностранных инвестиций (Инвестиции)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Сопровождение привлечения прямых иностранных инвестиций',
  'Astana Capital помогает казахстанским компаниям структурировать инвестиционные проекты, подготовить инвест-предложение и выйти на международных инвесторов. Сопровождение сделок от $1 млн.',
  'Инвестиции',
  'Astana Cap.',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Компания",
        "fields": [
          {"id":"inv1","type":"text","label":"БИН","required":true,"prefill_from":"egov.iin"},
          {"id":"inv2","type":"text","label":"Наименование","required":true,"prefill_from":"egov.org_name"},
          {"id":"inv3","type":"select","label":"Отрасль","required":true,"options":["Горнодобывающая","Нефтегазовая","Агропищевая","Логистика","Недвижимость","Технологии","Возобновляемая энергетика","Другое"]},
          {"id":"inv4","type":"number","label":"Объём привлекаемых инвестиций (USD)","required":true},
          {"id":"inv5","type":"select","label":"Стадия проекта","required":true,"options":["Прединвестиционная","Строительство","Запуск производства","Расширение действующего бизнеса"]}
        ]
      },
      {
        "id": "step_2",
        "title": "Проект",
        "fields": [
          {"id":"inv6","type":"textarea","label":"Краткое описание инвест-проекта","required":true},
          {"id":"inv7","type":"select","label":"Предпочтительная структура сделки","required":true,"options":["Долевое участие","Конвертируемый займ","SPV","Концессия","Другое"]},
          {"id":"inv8","type":"file","label":"Инвестиционный меморандум / IM","accept":".pdf","required":true},
          {"id":"inv9","type":"file","label":"Финансовая модель","accept":".pdf,.xlsx","required":true}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 10. Демеу — Гарантии для начинающих предпринимателей (Гарантии)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Гарантия по кредиту для начинающих предпринимателей',
  'Программа Демеу для ИП и ТОО с опытом работы менее 3 лет. Гарантия покрывает до 70% кредита в банке-партнёре, снижая требования к залогу.',
  'Гарантии',
  'Демеу',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Предприниматель",
        "fields": [
          {"id":"dg1","type":"text","label":"ИИН / БИН","required":true,"prefill_from":"egov.iin"},
          {"id":"dg2","type":"text","label":"ФИО / Наименование","required":true,"prefill_from":"egov.org_name"},
          {"id":"dg3","type":"select","label":"Организационно-правовая форма","required":true,"options":["ИП","ТОО","Крестьянское хозяйство"]},
          {"id":"dg4","type":"number","label":"Срок работы бизнеса (месяцев)","required":true},
          {"id":"dg5","type":"select","label":"Сфера бизнеса","required":true,"options":["Торговля","Услуги","Производство","Общественное питание","IT","Другое"]}
        ]
      },
      {
        "id": "step_2",
        "title": "Кредит",
        "fields": [
          {"id":"dg6","type":"select","label":"Банк-партнёр","required":true,"options":["Halyk Bank","Kaspi Bank","Jusan Bank","ForteBank","ЦентрКредит Банк","Bereke Bank"]},
          {"id":"dg7","type":"number","label":"Сумма кредита (тенге)","required":true},
          {"id":"dg8","type":"calculated","label":"Максимальная сумма гарантии (70%)","formula":"dg7 * 0.7","readonly":true},
          {"id":"dg9","type":"textarea","label":"Цель кредитования","required":true}
        ]
      },
      {
        "id": "step_3",
        "title": "Документы",
        "fields": [
          {"id":"dg10","type":"file","label":"Свидетельство о регистрации","accept":".pdf","required":true},
          {"id":"dg11","type":"file","label":"Бизнес-план","accept":".pdf","required":true},
          {"id":"dg12","type":"file","label":"Предварительное решение банка","accept":".pdf","required":false}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 11. Astana Cap. — Субсидирование инвестиционных проектов (Субсидии)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Субсидирование процентной ставки по инвестиционным кредитам',
  'Astana Capital субсидирует до 7 п.п. процентной ставки для инвестиционных проектов в приоритетных секторах экономики. Срок субсидирования — до 5 лет.',
  'Субсидии',
  'Astana Cap.',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Инвест-проект",
        "fields": [
          {"id":"s1","type":"text","label":"БИН","required":true,"prefill_from":"egov.iin"},
          {"id":"s2","type":"text","label":"Наименование организации","required":true,"prefill_from":"egov.org_name"},
          {"id":"s3","type":"select","label":"Сектор экономики","required":true,"options":["Обрабатывающая промышленность","Агропромышленный комплекс","Туризм","Логистика","Цифровая экономика","Зелёная энергетика"]},
          {"id":"s4","type":"number","label":"Сумма инвестиционного кредита (тенге)","required":true},
          {"id":"s5","type":"number","label":"Фактическая ставка банка (%)","required":true},
          {"id":"s6","type":"calculated","label":"Эффективная ставка после субсидии (приблизительно)","formula":"s5 - 7","readonly":true}
        ]
      },
      {
        "id": "step_2",
        "title": "Документы",
        "fields": [
          {"id":"s7","type":"file","label":"Кредитный договор","accept":".pdf","required":true},
          {"id":"s8","type":"file","label":"Бизнес-план / ТЭО инвест-проекта","accept":".pdf","required":true},
          {"id":"s9","type":"file","label":"Финансовая отчётность за 2 года","accept":".pdf","required":true}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);

-- 12. Демеу — Микрокредитование начинающих предпринимателей (Финансирование)
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
  'Микрокредитование для начинающих предпринимателей',
  'Займы до 8 000 МРП для граждан, желающих открыть или расширить малый бизнес. Ставка — 4% годовых, срок — до 5 лет. Не требуется залог при сумме до 3 000 МРП.',
  'Финансирование',
  'Демеу',
  'published',
  '{
    "steps": [
      {
        "id": "step_1",
        "title": "Заявитель",
        "fields": [
          {"id":"m1","type":"text","label":"ИИН","required":true,"prefill_from":"egov.iin"},
          {"id":"m2","type":"text","label":"ФИО","required":true,"prefill_from":"egov.org_name"},
          {"id":"m3","type":"select","label":"Статус","required":true,"options":["Зарегистрированный ИП","Планирую открыть ИП","Крестьянское хозяйство"]},
          {"id":"m4","type":"select","label":"Вид деятельности","required":true,"options":["Торговля","Услуги","Ремёсла","Общественное питание","Бытовые услуги","Другое"]},
          {"id":"m5","type":"checkbox","label":"Подтверждаю, что не являюсь получателем других льготных займов Демеу","required":true}
        ]
      },
      {
        "id": "step_2",
        "title": "Займ",
        "fields": [
          {"id":"m6","type":"number","label":"Запрашиваемая сумма (тенге)","required":true},
          {"id":"m7","type":"select","label":"Срок займа","required":true,"options":["12 месяцев","24 месяца","36 месяцев","48 месяцев","60 месяцев"]},
          {"id":"m8","type":"textarea","label":"Цель займа — на что планируете потратить","required":true},
          {"id":"m9","type":"calculated","label":"Ежемесячный платёж (оценочно, 4% годовых)","formula":"m6 * 0.04 / 12 + m6 / 12","readonly":true}
        ]
      }
    ]
  }',
  (SELECT id FROM users WHERE iin = '000000000000')
);
