# Script para consolidar todas as migrations em um único arquivo SQL
# Venditus - Database Setup Script

$migrationsPath = ".\supabase\migrations"
$outputFile = ".\supabase\ALL_MIGRATIONS_CONSOLIDATED.sql"

# Ordem dos arquivos (cronológica)
$migrationFiles = @(
    "20251126203502_remix_migration_from_pg_dump.sql",
    "20251126205001_013caad5-0361-4959-9bcf-ac2991c4d919.sql",
    "20251126205734_d23c0d90-fcac-4838-8c02-04ad002463c0.sql",
    "20251126231921_20b33a19-cc37-4faf-8f1d-2c2b1f7839c8.sql",
    "20251127162041_19eaece6-a44c-4f44-8dd2-1eb3ce505c29.sql",
    "20251127181637_51aa0bf6-6912-4d20-87ca-d08e968044fc.sql",
    "20251127191312_87ba676d-cb69-476c-835d-be6e67a3e6ca.sql",
    "20251127193017_fea28382-b68e-4305-9915-33d45c0f74a2.sql",
    "20251127200522_67838900-698b-402e-ab75-4931f52d6d69.sql",
    "20251201134959_09514f0f-53a0-4fbe-bee0-d335940ba567.sql",
    "20251201142920_4ee3b91a-f314-424c-83e6-e1508eaba162.sql",
    "20251201143229_9e462b7f-0d9a-491b-8308-8968c82f23a8.sql",
    "20251201143944_d4d48296-569c-4034-bd47-53f3fdf8e290.sql",
    "20251201144142_3669cb9f-c714-48aa-adcc-b266bce0b2c1.sql",
    "20251201152057_fb29ee79-ae01-4484-9edc-a65773bb92f5.sql",
    "20251201152142_5590d48a-b450-4e12-bdb6-c25f00d0ec7e.sql",
    "20251201163947_23de7579-c3e6-45b9-8228-9de06b1aec25.sql",
    "20251204213221_d7c03379-d4c0-4365-90ca-4d7d71f969a9.sql"
)

Write-Host "🚀 Venditus - Consolidando Migrations SQL..." -ForegroundColor Cyan
Write-Host ""

# Criar header do arquivo consolidado
$header = @"
-- ============================================================================
-- VENDITUS - Database Setup Script
-- ============================================================================
-- Este arquivo consolida todas as migrations do sistema Venditus
-- Gerado automaticamente em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- 
-- INSTRUÇÕES:
-- 1. Copie TODO o conteúdo deste arquivo
-- 2. Acesse o SQL Editor do Supabase
-- 3. Cole e execute (clique em "Run")
-- ============================================================================

"@

Set-Content -Path $outputFile -Value $header -Encoding UTF8

# Processar cada migration
$count = 0
foreach ($file in $migrationFiles) {
    $count++
    $filePath = Join-Path $migrationsPath $file
    
    if (Test-Path $filePath) {
        Write-Host "[$count/18] ✅ Adicionando: $file" -ForegroundColor Green
        
        # Adicionar separador e nome do arquivo
        $separator = @"

-- ============================================================================
-- Migration $count/18: $file
-- ============================================================================

"@
        Add-Content -Path $outputFile -Value $separator -Encoding UTF8
        
        # Adicionar conteúdo do arquivo
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        Add-Content -Path $outputFile -Value $content -Encoding UTF8
    } else {
        Write-Host "[$count/18] ❌ Arquivo não encontrado: $file" -ForegroundColor Red
    }
}

# Adicionar migration manual de políticas customizadas
Write-Host "[19/19] ✅ Adicionando: MANUAL_MIGRATION_custom_dashboards_policies.sql" -ForegroundColor Green
$manualMigrationPath = ".\supabase\MANUAL_MIGRATION_custom_dashboards_policies.sql"
if (Test-Path $manualMigrationPath) {
    $separator = @"

-- ============================================================================
-- Migration 19/19: MANUAL_MIGRATION_custom_dashboards_policies.sql
-- ============================================================================

"@
    Add-Content -Path $outputFile -Value $separator -Encoding UTF8
    $content = Get-Content -Path $manualMigrationPath -Raw -Encoding UTF8
    Add-Content -Path $outputFile -Value $content -Encoding UTF8
}

Write-Host ""
Write-Host "✅ Consolidação concluída!" -ForegroundColor Green
Write-Host "📄 Arquivo criado: $outputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Abra o arquivo: supabase\ALL_MIGRATIONS_CONSOLIDATED.sql" -ForegroundColor White
Write-Host "2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)" -ForegroundColor White
Write-Host "3. Acesse SQL Editor no Supabase" -ForegroundColor White
Write-Host "4. Cole e clique em 'Run' ▶️" -ForegroundColor White
Write-Host ""
