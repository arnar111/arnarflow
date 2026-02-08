; ArnarFlow NSIS Installer Customization
; Dark-themed installer colors

!macro customHeader
  !system "echo 'ArnarFlow custom installer'"
!macroend

!macro customInit
  ; Dark installer colors: text on background
  SetCtlColors $HWNDPARENT "0xeaeaea" "0x0f0f1a"
!macroend

!macro preInit
  ; Nothing needed
!macroend

!macro customInstall
  ; Post-install
!macroend
