-- yaaay config file!

-- define the statusline theme lvim is trash, default is sick
lvim.builtin.lualine.style = "default"

-- donot highlight the line that the cursor is on
vim.wo.cursorline = false

-- to change comment color
-- vim.cmd([[highlight Comment guifg=#677475]])

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


vim.cmd("colorscheme oxocarbon")



lvim.plugins = {
  {
    "JuliaEditorSupport/julia-vim", lazy = false
  },
  { "ellisonleao/gruvbox.nvim", priority = 1000, palette_overriders = { dark0_hard = "#1d2021" } },
  { "rebelot/kanagawa.nvim", lazy = false},
  { "shatur/neovim-ayu", lazy = false },
  { "tanvirtin/monokai.nvim", lazy = false },
  { "aditya-azad/candle-grey", lazy = false },
  { "neanias/everforest-nvim", priority = 1000, lazy = false},
  { "olivercederborg/poimandres.nvim", lazy = false }, { "elvessousa/sobrio", lazy = false },
  { "projekt0n/github-nvim-theme", lazy = false },
  { "ramojus/mellifluous.nvim", lazy = false },
  { "nyoom-engineering/oxocarbon.nvim", lazy = false},
  { "yorickpeterse/vim-paper", lazy = false },
  { "n1ghtmare/noirblaze-vim", lazy = false },
  { "kadekillary/skull-vim", lazy = false },
  { "chriskempson/base16-vim", lazy = false },
  { "kvrohit/rasmus.nvim", lazy = false },
  { "morhetz/gruvbox", lazy = false },
  { "NLKNguyen/papercolor-theme", lazy = false },
  { "bignimbus/pop-punk.vim", lazy = false },
  { "rose-pine/neovim", lazy = false },
  { "xiyaowong/transparent.nvim", lazy = false },
}

-- remaps
lvim.keys.normal_mode["|"] = ":vsplit<CR>"
lvim.keys.normal_mode["-"] = ":split<CR>"
