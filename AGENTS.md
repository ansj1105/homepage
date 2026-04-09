# AGENTS.md

## Project Identity
- This repository is currently operated as a Yonsei-style student community game service, not just a generic homepage renewal.
- Core live product themes are:
- `동연 파워랭킹`
- hunting/combat progression
- inventory/equipment/enhancement/cards/shop/collection
- community ranking and battle-power ranking
- Visual direction should favor high readability and Yonsei-aligned navy/white/black tones.

## Product Purpose
- The site is meant to feel like a campus-community game built around ranking, hunting, item drops, equipment growth, and light idle/click progression.
- The main loop is:
- login
- lobby
- choose hunting zone
- click combat / auto-hunt
- get drops
- equip / enhance / use consumables
- grow cards / set effects
- enter higher zones

## Important User Preferences Learned
- Avoid green-heavy or black-heavy backgrounds that reduce readability.
- Default palette should be white, navy blue, and black.
- Prefer borders over soft white cards with large radius.
- Content should not be overloaded onto one page when it can be split into separate routes.
- Inventory, enhancement, cards, shop, collection, hunting-zone select, and combat should stay separated as dedicated screens.
- `내 장비` is the primary place for equipment management.
- Hunting pages should emphasize combat flow and drop tables, not dump internal formulas and management panels.
- Mobile responsiveness matters and must be checked on ranking, inventory, hunting, and podium layouts.
- UI tone should feel game-like, but still readable and structured.

## Naming / Content Direction
- Monster and equipment naming should match Yonsei campus life and wording seen on the official Yonsei site.
- Recent naming references included terms such as:
- `연세포커스`
- `연세다움`
- `헤리티지`
- `브로슈어`
- `캠퍼스 가이드`
- `학생홍보대사`
- `연세비전`
- `장학금`
- `수강신청`
- `학사일정`
- `연구성과`
- `리서치 매거진`
- `NEXT NOBEL`
- Keep names campus-relevant rather than generic fantasy names when possible.

## Gameplay Rules To Preserve
- Equipment slots are 6-piece:
- weapon
- head
- top
- bottom
- shoes
- gloves
- Weapon must remain meaningful through strong flat attack contribution.
- Top/bottom percent bonuses should stay combined once, not stacked repeatedly.
- Shoes should not directly dominate damage scaling.
- Head gear should support card growth more than direct combat dominance.
- High-rarity drop systems should stay capped to avoid economy collapse.

## Deployment / Operations
- Production server: `ubuntu@3.88.238.122`
- Production path: `/var/www/homepage`
- Main deploy flow used in practice:
- push `feature/community-board-ranking`
- SSH to server
- `sudo git pull --rebase origin feature/community-board-ranking`
- `sudo bash ./scripts/deploy-prod.sh`
- Live domain: `https://sdsaasddf1.com/`

## Practical Notes
- README and older docs describe the original homepage-renewal scope; live implementation has expanded well beyond that.
- When there is tension between old docs and recent product behavior, prefer current live product direction unless the user says otherwise.
