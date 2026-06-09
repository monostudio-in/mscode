// src/core/extensionAPI/modules/uiModule.ts

import { Collapsible } from '@/ui/components/Collapsible/Collapsible';
import { Button }      from '@/ui/components/Button/Button';
import { SplitButton }      from '@/ui/components/Button/SplitButton';
import { Icon }        from '@/ui/components/Icon/IconRegistry';
import { InputBox }    from '@/ui/components/InputBox/InputBox';
import { Modal }       from '@/ui/components/Modal/Modal';
import { Select }      from '@/ui/components/Select/Select';
import { RichText }    from '@/ui/components/RichText/RichText';


export const createUIModule = (_extId: string) => ({
  /**
   * MS Code Native React Components.
   * Allows extension developers to build custom views that perfectly match the IDE's theme and behavior.
   */
  components: {
    /**
     * Highly flexible Collapsible/Accordion component.
     * * @example
     * const { Collapsible } = mscode.ui.components;
     * * const MyCustomView = () => (
     * <Collapsible 
     * title="Advanced Options" 
     * actions={[{ id: 'add', icon: 'plus', onClick: () => {} }]}
     * >
     * <div>Inside content</div>
     * </Collapsible>
     * );
     */
    Collapsible,
    
    /**
     * Standard MS Code Button. Supports variants and split-button layouts.
     */
    Button,
    SplitButton,
    
    /**
     * Standard MS Code Icon component leveraging the Codicon library.
     */
    Icon,

    /**
     * Native Input Box for text entry with optional inside-icons.
     */
    InputBox ,
    
    /**
     * Native MS Code Modal component for building custom dialogs.
     * @example
     * const { Modal } = mscode.ui.components;
     * <Modal isOpen={open} title="Custom Form" onClose={() => setOpen(false)}>
     * <input type="text" />
     * </Modal>
     */
    Modal ,
    
    /**
     * Native MS Code Select Dropdown.
     * @example
     * const { Select } = mscode.ui.components;
     * <Select options={[{label: 'A', value: 'a'}]} value={val} onChange={setVal} />
     */
    Select,
    
    /**
     * Native RichText component to render Markdown content (supports #setting# links).
     * @example
     * const { RichText } = mscode.ui.components;
     * * const content = "### Guide \n Click to configure: #editor.wordWrap#";
     * * <RichText 
     * text={content} 
     * onLinkClick={(settingId) => console.log('Open setting:', settingId)} 
     * />
     */
    RichText ,
    
    
  }
});

export type UIModule = ReturnType<typeof createUIModule>;