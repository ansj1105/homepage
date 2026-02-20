# Legacy Style Mapping (shinhotek stylesheet.css sync)

Updated: 2026-02-20
Source: `http://www.shinhotek.com/img_up/shop_pds/shinhotek/src_css/stylesheet.css`

## Scope
- Company Vision (`/company/vision`)
- Partner Core (`/partner/core`)
- Inquiry pages (`/inquiry/quote`, `/inquiry/test-demo`, `/inquiry/library`)
- Notice pages (`/notice`, `/notice/:id`)

## Selector Mapping
| Current Page Area | Current Class/Structure | Legacy Selector Source | Sync Status |
|---|---|---|---|
| Company shell title row | `.sub_name.clr`, `.sub_title` | `.sub_cont .sub_name`, `.sub_cont .sub_name .sub_title`, `.clr:after` | Synced |
| Company left nav | `.sub_nav`, `.aside_nav`, `.dep2` | `.sub_nav .aside_nav`, `.sub_nav .sub_navi .dep2>li>a` | Synced |
| CEO visual block | `.sub1_1 .img_sec` / `.company-ceo-visual` | `.sub1_1 .img_sec` | Synced |
| Vision content | `.sub1_2` + markdown block | `.sub1_2` typography/spacing rules | Synced (equivalent) |
| Partner core content | `.partner-core-content` | legacy partner text rhythm | Synced (equivalent) |
| Inquiry form table | `.inquiry` table + `.inquiry_btn` | `.inquiry table`, `.inquiry_btn` | Synced |
| Inquiry library list | `.list_board`, `.list_board_table`, `.search_wrap`, `.paginate` | same selectors | Synced |
| Notice list | migrated to `.list_board` structure | same selectors | Synced |
| Mobile behavior | `@media 1220/1024/767` legacy breakpoints | same breakpoint family | Synced |

## Asset Sync
- `sub1_1_img01.jpg` -> `public/assets/legacy-sync/sub1_1_img01.jpg`
- `sub1_2_img02.png` -> `public/assets/legacy-sync/sub1_2_img02.png`

## Notes
- Absolute `/img_up/...` URLs from legacy are replaced with local synced assets for stability.
- `NoticeDetailPage` keeps project detail-card pattern (`library-detail`) but list/index page is legacy table structure.
