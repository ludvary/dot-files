-- bootstrap lazy.nvim, LazyVim and your plugins
require("config.lazy")

-- to change comment color
vim.cmd([[highlight Comment guifg=#677475]])

-- relative line number
-- vim.o.relativenumber=true
-- i no longer want or need line numbers, i think without line numbers is cleaner
vim.cmd("set number!")
vim.cmd("set norelativenumber")

-- true colors
vim.o.termguicolors = true

-- line wraping
vim.o.wrap = true

-- autoindent
vim.o.autoindent = true

-- tabstop
vim.o.tabstop = 4

-- shiftwidth
vim.o.shiftwidth = 4

-- to make bg transparent
function Make_transp()
  vim.api.nvim_set_hl(0, "Normal", { bg = "none" })
  vim.api.nvim_set_hl(0, "NormalFloat", { bg = "none" })
end

-- -- COLORSCHEMES
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/catppuccin.nvim")
-- vim.cmd("colorscheme catppuccin")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/gruvbox.nvim")
-- -- vim.cmd("colorscheme gruvbox")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/kanagawa.nvim")
-- -- vim.cmd("colorscheme kanagawa-dragon")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/ayu.nvim")
-- -- vim.cmd("colorscheme ayu")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/monokai.nvim")
-- -- vim.cmd("colorscheme vim-monokai-tasty")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/austere.nvim")
-- -- vim.cmd("colorscheme austere")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/candle-grey.nvim")
-- -- vim.cmd("colorscheme candle-grey")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/everforest.nvim")
-- -- vim.cmd("colorscheme everforest")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/poimandres.nvim")
-- -- vim.cmd("colorscheme poimandres")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/boo.nvim")
-- -- vim.cmd("colorscheme boo")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/sobrio.nvim")
-- -- vim.cmd("colorscheme sobrio")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/oxocarbon.nvim")
-- -- vim.cmd("colorscheme oxocarbon")
--
-- -- vim.cmd("colorscheme radioactive_waste")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/sakura.nvim")
-- -- vim.cmd("colorscheme sakura")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/iceberg.nvim")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/dracula.nvim")
--
vim.cmd("set runtimepath+=~/.config/nvim/themes/gruvbox_material.nvim")
vim.cmd("let g:gruvbox_material_background = 'hard'")
-- vim.cmd("colorscheme gruvbox-material")
vim.cmd("colorscheme rose-pine-main")
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/gitthemes.nvim")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/gruvboxed.nvim")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/twilight.nvim")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/atlas.nvim")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/meh.nvim")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/komau.vim")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/pencil.nvim")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/monotone.nvim")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/noirblaze.nvim")
--
-- vim.cmd("set runtimepath+=~/.config/nvim/themes/monokai.nvim")
--
-- -- vim.cmd("colors oxocarbon")
-- vim.cmd("colors gruvboxed")

-- vim.cmd("colors monokai-pro-classic")
-- vim.cmd("colors monokai-pro-classic")

-- vim.cmd("set runtimepath+=~/.config/nvim/bloop.nvim") module "lush" not found
vim.cmd("set runtimepath+=~/.config/nvim/themes/Mountain") -- is also a nice colorscheme but doenst work for some reason.
-- vim.cmd("set runtimepath+=~/.config/nvim/rosepine.nvim")
-- vim.cmd("colorscheme rosepine")
-- vim.cmd("set runtimepath+=~/.config/nvim/mellifluous.nvim") is a nice one but says module "lush" not found :(
-- vim.cmd("colorscheme mellifluous")

-- vim.cmd("set runtimepath+=~/.config/nvim/zenbones.nvim") is a nice colorscheme, look into this, i think some module in the git repo is broken
-- vim.cmd("colorscheme rosebones")

-- vim.cmd("set runtimepath+=~/.config/nvim/moonfly.nvim") never using this stale shit jeez!
-- vim.cmd("colorscheme moonfly")

-- vim.cmd("set runtimepath+=~/.config/nvim/nyoom.nvim") couldnt figure this out
-- vim.cmd("colorscheme nyoom")
-------------------------------------------------------------------------------------------------
