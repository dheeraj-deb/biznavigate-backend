ALTER TABLE businesses
  ALTER COLUMN communication_mode SET DEFAULT 'AI';

UPDATE businesses
SET communication_mode = 'AI'
WHERE communication_mode = 'WORKFLOW';
