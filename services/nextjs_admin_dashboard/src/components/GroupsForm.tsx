'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowUpDown, CheckIcon, RotateCw, TriangleAlert } from 'lucide-react';
import { z } from 'zod';
import _ from 'lodash';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Input from '~/components/Input';
import { Group } from '~/libs/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/Form';
import Button from '~/components/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '~/components/Command';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/Popover';
import cn from '~/libs/className';
import useQuery from '~/libs/useQuery';
import deleteGroup from '~/actions/deleteGroup';
import queryGroupChildren from '~/actions/queryGroupChildren';
import { Alert, AlertDescription, AlertTitle } from '~/components/Alert';
import GroupsUserAddDialog from '~/components/GroupsUserAddDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/Dialog';
import upsertGroup from '~/actions/upsertGroup';

const GroupFormSchema = z.object({
  id: z.string().optional(),
  name: z.string({
    required_error: 'Group name is required',
  }),
  parent_id: z.string(),
});

interface GroupsFormProps {
  group: Group & { parent_name: string } & z.infer<typeof GroupFormSchema>;
}

export default function GroupsForm(props: GroupsFormProps) {
  const { group } = props;
  const [where, setWhere] = useState('');
  const parents = useQuery<Group>(
    () =>
      queryGroupChildren({
        id: group.id,
        page: 0,
        where: where ? `name like '%${where}%'` : '',
      }),
    {
      initialize: true,
      debounce: 500,
      dependencies: [group?.id, where],
    },
  );
  const form = useForm<z.infer<typeof GroupFormSchema>>({
    resolver: zodResolver(GroupFormSchema),
    defaultValues: { ...group, parent_id: group.parent_id || 'null' },
  });
  const remove = useQuery<Group>(() =>
    deleteGroup({ id: group.id }, ['/groups', `/groups/${group.id}`]),
  );
  const update = useQuery<Group>(() =>
    upsertGroup({
      id: form.getValues('id'),
      name: form.getValues('name'),
      parent_id:
        form.getValues('parent_id') === 'null'
          ? null
          : form.getValues('parent_id'),
    }),
  );
  const router = useRouter();

  // need small wrapper for server actions
  const _handleSubmit = async () => {
    try {
      const data = await update.execute();
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      } else if (data?.data?.rowCount !== 1) {
        throw new Error('UpsertGroupError: No rows added');
      } else {
        router.push(`/groups`);
      }
    } catch (error) {
      if (error instanceof Error) {
        form.setError('root.serverError', {
          type: 'manual',
          message: `ServerSideError: ${error.message}`,
        });
      }
    }
  };

  const _handleDeleteGroup = async () => {
    try {
      const data = await remove.execute();
      router.push(`/groups?v=${Date.now()}`);
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        form.setError('root.serverError', {
          type: 'manual',
          message: `ServerSideError: ${error.message}`,
        });
      }
    }
  };

  const formLoading = form.formState.isLoading || form.formState.isSubmitting;
  const parentGroups = _.compact(
    _.concat(
      [
        {
          id: 'null',
          name: 'No parent',
        } as Group,
      ],
      parents.data?.rows,
    ),
  ) as Group[];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(_handleSubmit)}
        className="py-4 space-y-6"
      >
        {form.formState.errors.root?.serverError && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Server Error</AlertTitle>
            <AlertDescription>
              {form.formState.errors.root?.serverError?.message}
            </AlertDescription>
          </Alert>
        )}
        <FormField
          name="id"
          control={form.control}
          render={({ field }) => <input {...field} type="hidden" />}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Parent Group</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-[200px] justify-between',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value
                        ? _.find(parentGroups, { id: field.value })?.name ||
                          group.parent_name
                        : 'Select parent group'}
                      <ArrowUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      onValueChange={(value) => {
                        if (value) {
                          setWhere(value);
                        } else {
                          setWhere('');
                        }
                      }}
                      value={where}
                      placeholder="Search groups..."
                      className="h-9"
                    />
                    {!parents.loading && _.isEmpty(parents.data?.rows) && (
                      <CommandEmpty>No groups found.</CommandEmpty>
                    )}
                    {parents.loading && (
                      <CommandLoading>Loading...</CommandLoading>
                    )}
                    <CommandGroup>
                      <CommandList>
                        {!parents.loading &&
                          _.map(parentGroups, (g) => (
                            <CommandItem
                              value={g.id}
                              key={g.id}
                              onSelect={() => {
                                form.setValue('parent_id', g.id, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                  shouldTouch: true,
                                });
                              }}
                            >
                              {g.name}
                              <CheckIcon
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  g.id === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                            </CommandItem>
                          ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div
          className={cn(
            'flex justify-between space-x-2 border rounded-lg p-4',
            group.id === 'new' && 'opacity-60',
          )}
        >
          <GroupsUserAddDialog id={group?.id} />
          <Button asChild>
            <Link href={`/groups/new?parent_id=${group.id}`}>
              Add sub-group
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Group</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this group?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={_handleDeleteGroup} variant="destructive">
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-x-2">
          <Button
            disabled={!form.formState.isDirty || formLoading}
            type="submit"
          >
            {formLoading && <RotateCw className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
          <Button
            variant="outline"
            type="reset"
            disabled={_.isEmpty(form.formState.dirtyFields)}
            onClick={() => form.reset()}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
