return {
  { "ellisonleao/gruvbox.nvim", priority = 1000, palette_overriders = { dark0_hard = "#1d2021" } },
  { "rebelot/kanagawa.nvim", lazy = false},
  { "shatur/neovim-ayu", lazy = false },
  { "tanvirtin/monokai.nvim", lazy = false },
  { "aditya-azad/candle-grey", lazy = false },
  { "neanias/everforest-nvim", priority = 1000, lazy = false},
  { "olivercederborg/poimandres.nvim", lazy = false },
  { "elvessousa/sobrio", lazy = false },
  { "projekt0n/github-nvim-theme", lazy = false },
  -- { "mcchrish/zenbones.nvim" },
  { "ramojus/mellifluous.nvim", lazy = false },
  { "nyoom-engineering/oxocarbon.nvim", lazy = false },
  { "yorickpeterse/vim-paper", lazy = false },
  { "n1ghtmare/noirblaze-vim", lazy = false },
  { "kadekillary/skull-vim", lazy = false },
  { "chriskempson/base16-vim", lazy = false },
  { "kvrohit/rasmus.nvim", lazy = false },
  { "morhetz/gruvbox", lazy = false },
  { "NLKNguyen/papercolor-theme", lazy = false },
  { "bignimbus/pop-punk.vim", lazy = false },
  { "rose-pine/neovim", lazy = false },
  {"itchyny/lightline.vim",lazy = false, priority = 1000},

-- plugin for tabline
  {'romgrk/barbar.nvim',
    dependencies = {
      'lewis6991/gitsigns.nvim', -- OPTIONAL: for git status
      'nvim-tree/nvim-web-devicons', -- OPTIONAL: for file icons
    },
    init = function() vim.g.barbar_auto_setup = false end,
    opts = {
      -- lazy.nvim will automatically call setup for you. put your options here, anything missing will use the default:
      -- animation = true,
      -- insert_at_start = true,
      -- …etc.
    },
    lazy = false,
    version = '^1.0.0', -- optional: only update when a new 1.x version is released
  },
}

