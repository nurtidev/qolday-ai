-- Remove seeded services (keep only the original leasing service from 001)
DELETE FROM services
WHERE org_name IN ('Демеу', 'KazGuarantee', 'KazExport', 'АгроКапитал', 'ИнноФонд', 'Astana Cap.')
  AND created_by = (SELECT id FROM users WHERE iin = '000000000000');
