import { mount } from '@vue/test-utils'
import { waitNT, waitRAF } from '../../../tests/utils'
import { BCalendar } from './calendar'
import { formatYMD } from '../../utils/date'

//  Note that JSDOM only supports `en-US` (`en`) locale for Intl

describe('calendar', () => {
  it('has expected base structure', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body
    })

    expect(wrapper.vm).toBeDefined()
    expect(wrapper.element.tagName).toBe('DIV')
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.classes()).toContain('b-calendar')
    expect(wrapper.find('.b-calendar>div').exists()).toBe(true)
    expect(wrapper.find('.b-calendar>div').attributes('role')).toEqual('group')
    expect(wrapper.find('.b-calendar>div').attributes('dir')).toBeDefined()
    expect(wrapper.find('.b-calendar>div').attributes('lang')).toBeDefined()
    const $header = wrapper.find('.b-calendar>div>header')
    expect($header.exists()).toBe(true)
    expect($header.find('output').exists()).toBe(true)
    expect($header.find('output').attributes('role')).toEqual('status')
    expect($header.find('output').attributes('for')).toBeDefined()
    expect($header.find('output').attributes('data-selected')).toEqual('')
    expect($header.find('output').attributes('aria-live')).toEqual('polite')
    expect($header.find('output').attributes('aria-atomic')).toEqual('true')
    expect(wrapper.find('.b-calendar>div>div.b-calendar-nav').exists()).toBe(true)
    expect(wrapper.find('.b-calendar>div>div.b-calendar-nav').attributes('role')).toEqual('group')
    expect(wrapper.findAll('.b-calendar>div>div.b-calendar-nav>button').length).toBe(5)
    expect(wrapper.find('.b-calendar>div>div[role="application"]').exists()).toBe(true)

    await waitNT(wrapper.vm)
    await waitRAF()

    wrapper.destroy()
  })

  it('has expected structure when value is set', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        value: '2020-02-15' // Leap year
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    const $header = wrapper.find('.b-calendar>div>header')
    expect($header.exists()).toBe(true)
    expect($header.find('output').exists()).toBe(true)
    expect($header.find('output').attributes('data-selected')).toEqual('2020-02-15')

    wrapper.destroy()
  })

  it('reacts to changes in value', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        value: '2020-01-01' // Leap year
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.vm.selectedYMD).toBe('2020-01-01')

    await wrapper.setProps({
      value: '2020-01-15'
    })

    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.vm.selectedYMD).toBe('2020-01-15')

    wrapper.destroy()
  })

  it('clicking a date selects date', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        value: '2020-01-01' // Leap year
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    const $grid = wrapper.find('[role="application"]')
    expect($grid.exists()).toBe(true)

    const $cell = wrapper.find('[data-date="2020-01-25"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('aria-selected')).toBeUndefined()
    expect($cell.attributes('id')).toBeDefined()
    const $btn = $cell.find('.btn')
    expect($btn.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).not.toEqual($cell.attributes('id'))

    await $btn.trigger('click')

    expect($cell.attributes('aria-selected')).toBeDefined()
    expect($cell.attributes('aria-selected')).toEqual('true')
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    wrapper.destroy()
  })

  it('date navigation buttons work', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        showDecadeNav: true,
        value: '2020-02-15' // Leap year
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    const $grid = wrapper.find('[role="application"]')
    expect($grid.exists()).toBe(true)
    expect($grid.attributes('data-month')).toBe('2020-02')

    const $navBtns = wrapper.findAll('.b-calendar-nav button')
    expect($navBtns.length).toBe(7)

    // Prev Month
    await $navBtns.at(2).trigger('click')
    expect($grid.attributes('data-month')).toBe('2020-01')

    // Next Month
    await $navBtns.at(4).trigger('click')
    expect($grid.attributes('data-month')).toBe('2020-02')

    // Prev Year
    await $navBtns.at(1).trigger('click')
    expect($grid.attributes('data-month')).toBe('2019-02')

    // Next Year
    await $navBtns.at(5).trigger('click')
    expect($grid.attributes('data-month')).toBe('2020-02')

    // Prev Decade
    await $navBtns.at(0).trigger('click')
    expect($grid.attributes('data-month')).toBe('2010-02')

    // Next Decade
    await $navBtns.at(6).trigger('click')
    expect($grid.attributes('data-month')).toBe('2020-02')

    // Current Month
    // Handle the rare case this test is run right at midnight where
    // the current month rolled over at midnight when clicked
    const thisMonth1 = formatYMD(new Date()).slice(0, -3)
    await $navBtns.at(3).trigger('click')
    const thisMonth2 = formatYMD(new Date()).slice(0, -3)
    const thisMonth = $grid.attributes('data-month')
    expect(thisMonth === thisMonth1 || thisMonth === thisMonth2).toBe(true)

    wrapper.destroy()
  })

  it('focus and blur methods work', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        value: '2020-02-15' // Leap year
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    const $grid = wrapper.find('[role="application"]')
    expect($grid.exists()).toBe(true)
    expect($grid.element.tagName).toBe('DIV')

    expect(document.activeElement).not.toBe($grid.element)

    wrapper.vm.focus()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(document.activeElement).toBe($grid.element)

    wrapper.vm.blur()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(document.activeElement).not.toBe($grid.element)

    wrapper.destroy()
  })

  it('clicking output header focuses grid', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        value: '2020-02-15' // Leap year
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    const $grid = wrapper.find('[role="application"]')
    expect($grid.exists()).toBe(true)
    expect($grid.element.tagName).toBe('DIV')

    expect(document.activeElement).not.toBe($grid.element)

    const $output = wrapper.find('header > output')
    expect($output.exists()).toBe(true)

    await $output.trigger('click')
    expect(document.activeElement).toBe($grid.element)

    wrapper.vm.blur()
    await waitNT(wrapper.vm)
    await waitRAF()
    expect(document.activeElement).not.toBe($grid.element)

    await $output.trigger('focus')
    expect(document.activeElement).toBe($grid.element)

    wrapper.destroy()
  })

  it('has correct header tag when "header-tag" prop is set', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        value: '2020-02-15', // Leap year,
        headerTag: 'div'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    const $header = wrapper.find('.b-calendar-header')
    expect($header.exists()).toBe(true)
    expect($header.element.tagName).toBe('DIV')

    wrapper.destroy()
  })

  it('keyboard navigation works', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        value: '2020-02-15' // Leap year
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    const $grid = wrapper.find('[role="application"]')
    expect($grid.exists()).toBe(true)
    expect($grid.attributes('aria-activedescendant')).toBeDefined()

    let $cell = wrapper.find('[data-date="2020-02-15"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    // Left
    await $grid.trigger('keydown.left')
    $cell = wrapper.find('[data-date="2020-02-14"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    // Right
    await $grid.trigger('keydown.right')
    $cell = wrapper.find('[data-date="2020-02-15"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    // Up
    await $grid.trigger('keydown.up')
    $cell = wrapper.find('[data-date="2020-02-08"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    // Down
    await $grid.trigger('keydown.down')
    $cell = wrapper.find('[data-date="2020-02-15"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    // PageUp
    await $grid.trigger('keydown.pageup')
    $cell = wrapper.find('[data-date="2020-01-15"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    // PageDown
    await $grid.trigger('keydown.pagedown')
    $cell = wrapper.find('[data-date="2020-02-15"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    // Alt + PageUp
    await $grid.trigger('keydown.pageup', { altKey: true })
    $cell = wrapper.find('[data-date="2019-02-15"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    // End (selected date)
    await $grid.trigger('keydown.end')
    $cell = wrapper.find('[data-date="2020-02-15"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    // Alt + PageDown
    await $grid.trigger('keydown.pagedown', { altKey: true })
    $cell = wrapper.find('[data-date="2021-02-15"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('id')).toBeDefined()
    expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

    // Home (today's date)
    await $grid.trigger('keydown.home')
    const todayID = $grid.attributes('aria-activedescendant')
    expect(todayID).toBeDefined()
    $cell = $grid.find(`#${todayID}`)
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('aria-label')).toBeDefined()
    expect($cell.attributes('aria-label')).toContain('(Today)')

    wrapper.destroy()
  })

  it('should disable key navigation when `no-key-nav` prop set', () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        noKeyNav: true,
        navButtonVariant: 'primary'
      }
    })

    const $nav = wrapper.find('.b-calendar-nav')
    const $buttons = $nav.findAll('button[tabindex="-1"]')

    expect($nav.attributes('tabindex')).toEqual('-1')
    expect($buttons.length).toEqual(5)
    expect(wrapper.find('.b-calendar>div>div[role="application"]').attributes('tabindex')).toEqual(
      '-1'
    )
  })

  it('`nav-button-variant` changes nav button class', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        navButtonVariant: 'primary'
      }
    })

    const $nav = wrapper.find('.b-calendar-nav')
    const $buttons = $nav.findAll('button')

    expect($buttons.length).toBe(5)
    expect($buttons.at(0).classes()).toContain('btn-outline-primary')
    expect($buttons.at(1).classes()).toContain('btn-outline-primary')
    expect($buttons.at(2).classes()).toContain('btn-outline-primary')
    expect($buttons.at(3).classes()).toContain('btn-outline-primary')
    expect($buttons.at(4).classes()).toContain('btn-outline-primary')
  })

  it('disables dates based on `date-disabled-fn` prop', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        value: '2020-01-01',
        dateDisabledFn(ymd) {
          return ymd === '2020-01-02'
        }
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    const $grid = wrapper.find('[role="application"]')
    expect($grid.exists()).toBe(true)

    let $cell = $grid.find('[data-date="2020-01-01"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('aria-disabled')).toBeUndefined()

    $cell = $grid.find('[data-date="2020-01-02"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('aria-disabled')).toEqual('true')

    $cell = $grid.find('[data-date="2020-01-03"]')
    expect($cell.exists()).toBe(true)
    expect($cell.attributes('aria-disabled')).toBeUndefined()

    wrapper.destroy()
  })

  it('applies classes on dates based on `date-info-fn` prop', async () => {
    const wrapper = mount(BCalendar, {
      attachTo: document.body,
      propsData: {
        value: '2020-01-01',
        dateInfoFn(ymd) {
          return ymd === '2020-01-02' ? 'my-info' : null
        }
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    const $grid = wrapper.find('[role="application"]')
    expect($grid.exists()).toBe(true)

    let $cell = $grid.find('[data-date="2020-01-01"]')
    expect($cell.exists()).toBe(true)
    expect($cell.classes()).not.toContain('my-info')

    $cell = $grid.find('[data-date="2020-01-02"]')
    expect($cell.exists()).toBe(true)
    expect($cell.classes()).toContain('my-info')

    $cell = $grid.find('[data-date="2020-01-03"]')
    expect($cell.exists()).toBe(true)
    expect($cell.classes()).not.toContain('my-info')

    wrapper.destroy()
  })

  describe('types', () => {
    describe('date', () => {
      it('has expected header output when no value is set', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'date'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $header = wrapper.find('.b-calendar>div>header')
        expect($header.exists()).toBeTruthy()
        expect($header.find('output').exists()).toBeTruthy()
        expect($header.find('output').text()).toEqual('No date selected')

        wrapper.destroy()
      })

      it('has the correct navigation buttons for date `type` calendar', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            value: '2021-01-01'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        expect($grid.attributes('data-month')).toBe('2021-01')
        expect($grid.find('.b-calendar-grid-caption').text()).toEqual('January 2021')

        const $navBtns = wrapper.findAll('.b-calendar-nav button')
        expect($navBtns.length).toBe(5)

        wrapper.destroy()
      })

      it('grid contains days', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer()
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        const $gridBody = $grid.find('.b-calendar-grid-body')
        expect($gridBody.findAll('.row').length).toBeGreaterThanOrEqual(4)
        expect($gridBody.find('.row').findAll('.col').length).toBe(7)

        wrapper.destroy()
      })
    })

    describe('day', () => {
      it('has expected header output when no value is set', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'day'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $header = wrapper.find('.b-calendar>div>header')
        expect($header.exists()).toBeTruthy()
        expect($header.find('output').exists()).toBeTruthy()
        expect($header.find('output').text()).toEqual('No day selected')

        wrapper.destroy()
      })

      it('navigation buttons do not exist', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            value: '2021-01-01',
            type: 'day'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        expect($grid.attributes('data-month')).toBe('2021-01')
        expect($grid.find('.b-calendar-grid-caption').text()).toEqual('Days')

        const $navBtns = wrapper.findAll('.b-calendar-nav button')
        expect($navBtns.length).toBe(0)

        wrapper.destroy()
      })

      it('grid contains days of the week', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer()
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        const $gridBody = $grid.find('.b-calendar-grid-body')
        expect($gridBody.findAll('.row').length).toBeGreaterThanOrEqual(4)
        expect($gridBody.find('.row').findAll('.col').length).toBe(7)

        wrapper.destroy()
      })

      it('keyboard navigation works', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'day',
            value: '2021-10-08'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        expect($grid.attributes('aria-activedescendant')).toBeDefined()

        let $cell = wrapper.find('[data-date="2021-10-08"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('Friday')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Left (does nothing)
        await $grid.trigger('keydown.left')
        $cell = wrapper.find('[data-date="2021-10-08"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('Friday')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Right (does nothing)
        await $grid.trigger('keydown.right')
        $cell = wrapper.find('[data-date="2021-10-08"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('Friday')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Up
        await $grid.trigger('keydown.up')
        $cell = wrapper.find('[data-date="2021-10-07"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('Thursday')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Down
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2021-10-08"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('Friday')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Down
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2021-10-09"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('Saturday')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Down (should jump back to Sunday)
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2021-10-03"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('Sunday')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))
        // jump back to Friday
        await $grid.trigger('keydown.up')
        await $grid.trigger('keydown.up')

        // PageUp (does nothing)
        await $grid.trigger('keydown.pageup')
        $cell = wrapper.find('[data-date="2021-10-08"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('Friday')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // PageDown (does nothing)
        await $grid.trigger('keydown.pagedown')
        $cell = wrapper.find('[data-date="2021-10-08"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('Friday')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // End (selected date)
        await $grid.trigger('keydown.end')
        $cell = wrapper.find('[data-date="2021-10-08"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('Friday')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Home (today's date)
        await $grid.trigger('keydown.home')
        const todayID = $grid.attributes('aria-activedescendant')
        expect(todayID).toBeDefined()
        $cell = $grid.find(`#${todayID}`)
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('aria-label')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('(Today)')

        wrapper.destroy()
      })
    })

    describe('month', () => {
      it('has expected header output when no value is set', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'month'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $header = wrapper.find('.b-calendar>div>header')
        expect($header.exists()).toBeTruthy()
        expect($header.find('output').exists()).toBeTruthy()
        expect($header.find('output').text()).toEqual('No month selected')

        wrapper.destroy()
      })

      it('clicking a month selects it', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            value: '2021-01-01', // January
            type: 'month'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()

        const $cell = wrapper.find('[data-date="2021-02-01"]') // February
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('aria-selected')).toBeUndefined()
        expect($cell.attributes('id')).toBeDefined()
        const $btn = $cell.find('.btn')
        expect($btn.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($grid.attributes('aria-activedescendant')).toBeDefined()
        expect($grid.attributes('aria-activedescendant')).not.toEqual($cell.attributes('id'))

        await $btn.trigger('click')

        expect($cell.attributes('aria-selected')).toBeDefined()
        expect($cell.attributes('aria-selected')).toEqual('true')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        expect(wrapper.vm.selectedYMD).toBe('2021-02-01')

        wrapper.destroy()
      })

      it('navigation buttons do not exist', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'month',
            value: '2021-01-01'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        expect($grid.attributes('data-month')).toBe('2021-01')
        expect($grid.find('.b-calendar-grid-caption').text()).toEqual('Months')

        const $navBtns = wrapper.findAll('.b-calendar-nav button')
        expect($navBtns.length).toBe(0)

        wrapper.destroy()
      })

      it('grid contains months', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'month'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        const $gridBody = $grid.find('.b-calendar-grid-body')
        expect($gridBody.findAll('.row').length).toBe(6)
        expect($gridBody.findAll('.row .col.month').length).toBe(12)

        wrapper.destroy()
      })

      it('keyboard navigation works', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'month',
            value: '2021-10-01'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        expect($grid.attributes('aria-activedescendant')).toBeDefined()

        let $cell = wrapper.find('[data-date="2021-10-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('October')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Left
        await $grid.trigger('keydown.left')
        $cell = wrapper.find('[data-date="2021-09-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('September')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Right
        await $grid.trigger('keydown.right')
        $cell = wrapper.find('[data-date="2021-10-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('October')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        await $grid.trigger('keydown.right')
        $cell = wrapper.find('[data-date="2021-11-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('November')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Up
        await $grid.trigger('keydown.up')
        $cell = wrapper.find('[data-date="2021-09-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('September')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Down
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2021-11-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('November')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Down (should jump back to January)
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2021-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('January')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // December should jump back to January
        await $grid.trigger('keydown.right')
        await $grid.trigger('keydown.up')
        $cell = wrapper.find('[data-date="2021-12-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('December')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))
        // jump back to January
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2021-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('January')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // PageUp (does nothing)
        await $grid.trigger('keydown.pageup')
        $cell = wrapper.find('[data-date="2021-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('January')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // PageDown (does nothing)
        await $grid.trigger('keydown.pagedown')
        $cell = wrapper.find('[data-date="2021-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('January')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // End (selected date)
        await $grid.trigger('keydown.end')
        $cell = wrapper.find('[data-date="2021-10-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('October')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Home (today's date)
        await $grid.trigger('keydown.home')
        const todayID = $grid.attributes('aria-activedescendant')
        expect(todayID).toBeDefined()
        $cell = $grid.find(`#${todayID}`)
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('aria-label')).toBeDefined()

        wrapper.destroy()
      })
    })

    describe('year', () => {
      it('has expected header output when no value is set', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'year'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $header = wrapper.find('.b-calendar>div>header')
        expect($header.exists()).toBeTruthy()
        expect($header.find('output').exists()).toBeTruthy()
        expect($header.find('output').text()).toEqual('No year selected')

        wrapper.destroy()
      })

      it('clicking a year selects it', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            value: '2021-01-01',
            type: 'year'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()

        const $cell = wrapper.find('[data-date="2022-01-01"]') // 2022
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('aria-selected')).toBeUndefined()
        expect($cell.attributes('id')).toBeDefined()
        const $btn = $cell.find('.btn')
        expect($btn.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($grid.attributes('aria-activedescendant')).toBeDefined()
        expect($grid.attributes('aria-activedescendant')).not.toEqual($cell.attributes('id'))

        await $btn.trigger('click')

        expect($cell.attributes('aria-selected')).toBeDefined()
        expect($cell.attributes('aria-selected')).toEqual('true')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        expect(wrapper.vm.selectedYMD).toBe('2022-01-01')

        wrapper.destroy()
      })

      it('decade navigation buttons work', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'year',
            value: '2021-01-01'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        expect($grid.attributes('data-month')).toBe('2021-01')
        expect($grid.find('.b-calendar-grid-caption').text()).toEqual('2020 - 2029')

        const $navBtns = wrapper.findAll('.b-calendar-nav button')
        expect($navBtns.length).toBe(3)

        // Prev Decade
        await $navBtns.at(0).trigger('click')
        expect($grid.attributes('data-month')).toBe('2011-01')
        expect($grid.find('.b-calendar-grid-caption').text()).toEqual('2010 - 2019')

        // Next Decade
        await $navBtns.at(2).trigger('click')
        expect($grid.attributes('data-month')).toBe('2021-01')
        expect($grid.find('.b-calendar-grid-caption').text()).toEqual('2020 - 2029')

        wrapper.destroy()
      })

      it('grid contains years', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'year'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        const $gridBody = $grid.find('.b-calendar-grid-body')
        expect($gridBody.findAll('.row').length).toBe(5)
        expect($gridBody.findAll('.row .col.year').length).toBe(10)

        wrapper.destroy()
      })

      it('keyboard navigation works', async () => {
        const wrapper = mount(BCalendar, {
          attachTo: createContainer(),
          propsData: {
            type: 'year',
            value: '2021-01-01'
          }
        })

        expect(wrapper.vm).toBeDefined()
        await waitNT(wrapper.vm)
        await waitRAF()

        const $grid = wrapper.find('[role="application"]')
        expect($grid.exists()).toBeTruthy()
        expect($grid.attributes('aria-activedescendant')).toBeDefined()

        let $cell = wrapper.find('[data-date="2021-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2021')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Left
        await $grid.trigger('keydown.left')
        $cell = wrapper.find('[data-date="2020-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2020')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Right
        await $grid.trigger('keydown.right')
        $cell = wrapper.find('[data-date="2021-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2021')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        await $grid.trigger('keydown.right')
        $cell = wrapper.find('[data-date="2022-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2022')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Up
        await $grid.trigger('keydown.up')
        $cell = wrapper.find('[data-date="2020-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2020')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Down
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2022-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2022')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Down (should jump to next decade)
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2024-01-01"]')
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2026-01-01"]')
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2028-01-01"]')
        await $grid.trigger('keydown.down')
        $cell = wrapper.find('[data-date="2030-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2030')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Up (should jump to previous decade)
        await $grid.trigger('keydown.up')
        $cell = wrapper.find('[data-date="2028-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2028')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // PageUp (jumps to previous decade)
        await $grid.trigger('keydown.pageup')
        $cell = wrapper.find('[data-date="2018-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2018')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // PageDown (jumps to next decade)
        await $grid.trigger('keydown.pagedown')
        $cell = wrapper.find('[data-date="2028-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2028')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // End (selected date)
        await $grid.trigger('keydown.end')
        $cell = wrapper.find('[data-date="2021-01-01"]')
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('id')).toBeDefined()
        expect($cell.attributes('aria-label')).toContain('2021')
        expect($grid.attributes('aria-activedescendant')).toEqual($cell.attributes('id'))

        // Home (today's date)
        await $grid.trigger('keydown.home')
        const todayID = $grid.attributes('aria-activedescendant')
        expect(todayID).toBeDefined()
        $cell = $grid.find(`#${todayID}`)
        expect($cell.exists()).toBeTruthy()
        expect($cell.attributes('aria-label')).toBeDefined()

        wrapper.destroy()
      })
    })
  })
})
