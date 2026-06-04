ALTER TABLE businesses
  ALTER COLUMN communication_mode SET DEFAULT 'WORKFLOW';

UPDATE businesses
SET communication_mode = 'WORKFLOW'
WHERE communication_mode IS DISTINCT FROM 'WORKFLOW';
