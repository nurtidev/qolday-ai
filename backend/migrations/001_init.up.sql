CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'author', 'user');
CREATE TYPE service_status AS ENUM ('draft', 'published');
CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected');

CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iin        VARCHAR(12) UNIQUE NOT NULL,
    full_name  VARCHAR(255) NOT NULL,
    org_name   VARCHAR(255),
    role       user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE services (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    category    VARCHAR(100),
    org_name    VARCHAR(255),
    status      service_status NOT NULL DEFAULT 'draft',
    form_schema JSONB NOT NULL DEFAULT '{}',
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE applications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    form_data  JSONB NOT NULL DEFAULT '{}',
    status     application_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    name           VARCHAR(255) NOT NULL,
    file_url       VARCHAR(500) NOT NULL,
    uploaded_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    message    TEXT,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_status   ON services(status);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_service ON applications(service_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Seed admin user (iin = 000000000000)
INSERT INTO users (iin, full_name, role) VALUES ('000000000000', 'Администратор', 'admin');

-- Seed control case: leasing service
INSERT INTO services (title, description, category, org_name, status, form_schema, created_by)
VALUES (
    'Приобретение авиатранспорта и вагонов в лизинг',
    'Программа лизинга транспортных средств для предприятий МСБ и крупного бизнеса через дочерние организации Байтерека.',
    'Лизинг',
    'АО «НИХ «Байтерек»',
    'published',
    '{
      "steps": [
        {
          "id": "step_1",
          "title": "Информация о компании",
          "fields": [
            {"id":"field_1","type":"text","label":"БИН организации","placeholder":"123456789012","required":true,"prefill_from":"egov.iin"},
            {"id":"field_2","type":"text","label":"Наименование организации","placeholder":"ТОО ...","required":true,"prefill_from":"egov.org_name"},
            {"id":"field_3","type":"select","label":"Тип организации","options":["МСБ","Крупный бизнес"],"required":true},
            {"id":"field_4","type":"select","label":"Предмет лизинга","options":["Авиатранспорт","Вагоны"],"required":true},
            {"id":"field_5","type":"number","label":"Количество единиц","required":true},
            {"id":"field_6","type":"number","label":"Стоимость единицы (тенге)","required":true,"mask":"currency"},
            {"id":"field_7","type":"calculated","label":"Общая стоимость","formula":"field_5 * field_6","readonly":true},
            {"id":"field_8","type":"calculated","label":"Запрашиваемая сумма лизинга","formula":"field_7 * 0.8","readonly":true},
            {"id":"field_9","type":"select","label":"Срок лизинга (месяцев)","options":["12","24","36","48","60"],"required":true},
            {"id":"field_10","type":"calculated","label":"Ежемесячный платёж","formula":"field_8 / field_9","readonly":true}
          ]
        },
        {
          "id": "step_2",
          "title": "Документы",
          "condition": {"field_id":"field_3","operator":"equals","value":"МСБ"},
          "fields": [
            {"id":"field_11","type":"file","label":"Финансовая отчётность за 2 года","accept":".pdf","required":true},
            {"id":"field_12","type":"file","label":"Бизнес-план","accept":".pdf","required":true},
            {"id":"field_13","type":"file","label":"Учредительные документы","accept":".pdf","required":true}
          ]
        }
      ]
    }',
    (SELECT id FROM users WHERE iin = '000000000000')
);
